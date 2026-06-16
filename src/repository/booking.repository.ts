import { Prisma ,idempotencykey } from "@prisma/client";
import prismaClient from '../config/client'
import { validate as isValidate } from "uuid";
import { BadRequestError, NotFoundError } from "../utils/errors/app.error";

export async function createBooking(
  bookingInput: Prisma.bookingCreateInput 
) {
  const booking = await prismaClient.booking.create({
    data: bookingInput,
  });

  return booking;
}

export async function createIdempotencyKey(key: string , bookingId: number){

  const idempotencyKey = await prismaClient.idempotencykey.create({
    data: {
      Idemkey:key,
      updatedAt: new Date(),
      booking :{
        connect:{
          id: bookingId
        }
      }
    }
  })
  return idempotencyKey
}

export async function getIdempotencyKeyWithLock(key:string,tx:Prisma.TransactionClient){

  console.log("key is",key)
  if(!isValidate(key)){

    throw new BadRequestError('Key is not validated')

  }
const idempotencyKey: Array<idempotencykey> = await tx.$queryRaw`
  SELECT *
  FROM idempotencykey
  WHERE Idemkey = ${key}
  FOR UPDATE
`

  console.log("Idempotency with the lock ",idempotencyKey)

  if(!idempotencyKey || idempotencyKey.length===0){

    throw new NotFoundError("IdempotencyKey Not found")
  }
          
  return idempotencyKey[0]
}

export async function getBookingById(bookingId: number){

  const booking = await prismaClient.booking.findUnique({
    
    where:{
      id: bookingId
    }

  })
  return booking
}

export async function confirmBooking(bookingId: number,tx:Prisma.TransactionClient){

  const booking = await tx.booking.update({
    where:{
      id: bookingId
    },
    data:{
      status: "CONFIRMED"
    }
  })
  return booking
}
export async function cancelBooking(bookingId: number){

  const booking = await prismaClient.booking.update({
    where:{
      id: bookingId
    },
    data:{
      status: "CONFIRMED"
    }
  })
  return booking
}

export async function finalizeIdempotencyKey(key: string,tx:Prisma.TransactionClient){
  const idempotency = await tx.idempotencykey.update({

    where:{
    Idemkey:key
    },
    data:{
      finalized: true
    }
  })
return idempotency
} 