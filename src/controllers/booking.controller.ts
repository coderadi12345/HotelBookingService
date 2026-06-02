import { NextFunction, Request, Response } from "express";
import { createBookingService, finalizeBookingService } from "../service/bookingservice";

export async function createBookingHandler(req: Request,res:Response,next:NextFunction){

    const booking = await createBookingService(req.body)
    

    res.status(201).json({
        bookingId: booking.bookingId,
        idempotencyKey: booking.idempotencyKey
    })

}

export async function confirmBookingHandler(req:Request,res:Response){

    const booking = await finalizeBookingService(req.params.idempotencyKey)

    res.status(201).json({
        bookingId:booking.id,
        status:booking.status
    })
} 