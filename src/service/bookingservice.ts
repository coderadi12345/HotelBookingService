import { CreateBookingDTO} from "../DTO/booking.dto";
import { confirmBooking, createBooking, createIdempotencyKey,finalizeIdempotencyKey,getIdempotencyKeyWithLock } from "../repository/booking.repository";
import { BadRequestError, InternalServerError, NotFoundError } from "../utils/errors/app.error";
import { generateIdempotencyKey } from "../utils/generateIdempotecncyKey";
import prismaClient from "../config/client";
import { redlock } from "../config/redis.config";

export async  function createBookingService(createBookingDTO:CreateBookingDTO){

const ttl = 50000
const bookingResource = `hotel:${createBookingDTO.hotelId}`

console.log(`Acquring lock for the resource : ${bookingResource} with TTL ${ttl}` )

let lock

try {
    lock = await redlock.acquire([bookingResource],ttl)
    console.log(`Lock acquired for resource :${bookingResource}`,lock)

    const booking = await createBooking({
    userId: createBookingDTO.userId,
    hotelId: createBookingDTO.hotelId,
    totalGuests: createBookingDTO.totalGuests,
    bookingAmount: createBookingDTO.bookingAmount,
    status: "PENDING",
    updatedAt: new Date()
});

    const idempotencyKey = generateIdempotencyKey()

await createIdempotencyKey(idempotencyKey,booking.id)

    return{
        bookingId:booking.id,
        idempotencyKey:idempotencyKey
    }

} catch (error) {
    throw new InternalServerError("Failed to acquire lock for resource ")
}

}
    
export async function finalizeBookingService(idempotencyKey:string){

  return await prismaClient.$transaction(async (tx )=>{

    const idempotencyData = await getIdempotencyKeyWithLock(idempotencyKey,tx)

if(!idempotencyData){
    throw new NotFoundError("IdempotencyKey not found")
}

if(idempotencyData.finalized){
    throw new BadRequestError("IdempotencyKey previously generated")
}

const booking = await confirmBooking(idempotencyData.bookingId,tx)
await finalizeIdempotencyKey(idempotencyKey,tx)
return booking
}

  )
  }

