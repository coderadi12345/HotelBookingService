import { CreateBookingDTO} from "../DTO/booking.dto";
import { confirmBooking, createBooking, createIdempotencyKey,finalizeIdempotencyKey,getIdempotencyKey } from "../repository/booking.repository";
import { BadRequestError, NotFoundError } from "../utils/errors/app.error";
import { generateIdempotencyKey } from "../utils/generateIdempotecncyKey";

export async  function createBookingService(createBookingDTO:CreateBookingDTO){
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
}
    
export async function finalizeBookingService(idempotencyKey:string){

const idempotencyData = await getIdempotencyKey(idempotencyKey)

if(!idempotencyData){
    throw new NotFoundError("IdempotencyKey not found")
}

if(idempotencyData.finalized){
    throw new BadRequestError("IdempotencyKey previously generated")
}

const booking = await confirmBooking(idempotencyData.bookingId)
await finalizeIdempotencyKey(idempotencyKey)
return booking
}
