import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import Notification from '@/lib/models/Notification';
import { sendOrderStatusUpdateEmail } from '@/lib/email';

function getOrderLookupQuery(id: string) {
  if (mongoose.Types.ObjectId.isValid(id) && id.length === 24) {
    return { $or: [{ _id: id }, { orderId: id }] };
  }
  return { orderId: id };
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const db = await connectToDatabase();
    if (db && Order) {
      const order = await Order.findOne(getOrderLookupQuery(id));
      if (order) {
        return NextResponse.json({ success: true, order });
      }
    }
    return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const {
      fulfillmentStatus,
      paymentStatus,
      trackingNumber,
      courierPartner,
      notes,
      updatedBy = 'Roastery Admin',
    } = body;

    const db = await connectToDatabase();
    if (!db || !Order) {
      return NextResponse.json({
        success: true,
        message: 'Status updated (Mock mode)',
        orderId: id,
        fulfillmentStatus,
        paymentStatus,
        trackingNumber,
        courierPartner,
      });
    }

    const query = getOrderLookupQuery(id);
    const existingOrder = await Order.findOne(query);
    if (!existingOrder) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const statusDescriptions: Record<string, { title: string; desc: string }> = {
      PENDING: {
        title: 'Order Queued at Roastery Counter',
        desc: 'Order logged and verified for grading & packaging.',
      },
      PROCESSING: {
        title: 'Fresh Roasting & Nitrogen Packaging',
        desc: 'Cashews are being freshly processed, weighed, and sealed at our Uppal facility.',
      },
      SHIPPED: {
        title: 'Consignment Dispatched to Courier',
        desc: `Handed over to ${courierPartner || existingOrder.courierPartner || 'Logistics Partner'}. Waybill: ${trackingNumber || existingOrder.trackingNumber || 'Active'}.`,
      },
      DELIVERED: {
        title: 'Consignment Delivered Safely',
        desc: 'Package handed over to customer address. Thank you for choosing SVT!',
      },
      CANCELLED: {
        title: 'Order Cancelled',
        desc: notes || 'Order has been cancelled by store administrator.',
      },
    };

    const isStatusChanged = fulfillmentStatus && fulfillmentStatus !== existingOrder.fulfillmentStatus;
    const isTrackingAdded = (trackingNumber && trackingNumber !== existingOrder.trackingNumber) || (courierPartner && courierPartner !== existingOrder.courierPartner);

    const updateFields: any = {};
    if (fulfillmentStatus) updateFields.fulfillmentStatus = fulfillmentStatus;
    if (paymentStatus) updateFields.paymentStatus = paymentStatus;
    if (trackingNumber) updateFields.trackingNumber = trackingNumber;
    if (courierPartner) updateFields.courierPartner = courierPartner;
    if (notes) updateFields.notes = notes;

    // Build timeline event if status changed or tracking updated
    if (isStatusChanged || isTrackingAdded) {
      const activeStatus = fulfillmentStatus || existingOrder.fulfillmentStatus;
      const config = statusDescriptions[activeStatus] || {
        title: `Status Updated: ${activeStatus}`,
        desc: notes || 'Milestone updated by roastery admin.',
      };

      const timelineEvent = {
        status: activeStatus,
        title: isTrackingAdded && !isStatusChanged ? 'Courier Waybill Assigned' : config.title,
        description: isTrackingAdded && !isStatusChanged
          ? `Consignment linked with ${courierPartner || updateFields.courierPartner || 'Courier'}. Tracking No: ${trackingNumber || updateFields.trackingNumber}`
          : config.desc,
        timestamp: new Date(),
        courierPartner: courierPartner || existingOrder.courierPartner,
        trackingNumber: trackingNumber || existingOrder.trackingNumber,
        updatedBy,
      };

      updateFields.$push = { timeline: timelineEvent };
    }

    const updatedOrder = await Order.findOneAndUpdate(
      query,
      updateFields,
      { new: true }
    );

    // ── SEND CUSTOMER STATUS UPDATE EMAIL & NOTIFICATION ──
    if (updatedOrder && (isStatusChanged || isTrackingAdded)) {
      const targetEmail = updatedOrder.customerDetails?.email;

      // 1. Email notification
      try {
        if (targetEmail) {
          await sendOrderStatusUpdateEmail(
            updatedOrder,
            fulfillmentStatus || updatedOrder.fulfillmentStatus,
            trackingNumber || updatedOrder.trackingNumber,
            courierPartner || updatedOrder.courierPartner,
            notes
          );
        }
      } catch (emailErr) {
        console.warn('Status update email failed:', emailErr);
      }

      // 2. In-app notification
      try {
        if (Notification) {
          await Notification.create({
            recipientType: 'USER',
            recipientEmail: targetEmail ? targetEmail.toLowerCase().trim() : undefined,
            userId: updatedOrder.userId || undefined,
            orderId: updatedOrder.orderId,
            type: fulfillmentStatus === 'DELIVERED' ? 'DELIVERY' : 'ORDER_STATUS',
            title: `Order #${updatedOrder.orderId} ${fulfillmentStatus || 'Updated'}`,
            message: isTrackingAdded
              ? `Tracking info updated: ${courierPartner || updatedOrder.courierPartner} (Waybill: ${trackingNumber || updatedOrder.trackingNumber})`
              : `Status updated to ${fulfillmentStatus}. Follow live milestone progress in your dashboard.`,
            link: '/dashboard?tab=track',
            metadata: {
              orderId: updatedOrder.orderId,
              status: fulfillmentStatus,
              trackingNumber: updatedOrder.trackingNumber,
            },
          });
        }
      } catch (notifErr) {
        console.warn('In-app notification creation error:', notifErr);
      }
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    console.error('PATCH /api/orders/[id] error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
