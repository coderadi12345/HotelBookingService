import {z} from 'zod'

export const bookingSchema = z.object({

    userId: z.number({message: "User ID must be present"}),
    hotelId: z.number({message: "Hotel ID must be present"}),
    totalGuests: z.number({message: "Total guests must be present "}).min(1,{message: "Total guest must be atleast 1"}),
    bookingAmount: z.number({message: "Booking Amount must be present "}).min(1,{message: "Booking Amount must be greater than 0"})
})
