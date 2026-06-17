import { NotificationDto } from "../DTO/notification.dto"
import { mailerQueue } from "../queues/email.queue"

export const MAILER_PAYLOAD = "payload:mail"

export const addEmailToQueue  = async (payload: NotificationDto)=>{
    await mailerQueue.add(MAILER_PAYLOAD,payload)
    console.log(`Email Added to Queue,${JSON.stringify(payload)}`)
}