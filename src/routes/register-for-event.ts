import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { badRequest } from "./_errors/bad-request";
import ShortUniqueId from "short-unique-id";

export async function registerForEvent(app: FastifyInstance){
    app
    .withTypeProvider<ZodTypeProvider>()
    .post('/events/:eventId/attendees',{
        schema:{
            summary: 'register an attendee',
            tags: ['attendees'],
            body: z.object({
                name: z.string().min(4),
                email: z.string().email(),
            }),
            params: z.object({
                eventId: z.string().uuid(),
            }),
            response: {
                201: z.object({
                    attendeeId: z.number(),
                    code: z.string()
                })
            }
        }
    }, 
    async (request, reply) => {
        const { eventId } = request.params;
        const { name, email } = request.body;  

        const attendeeFromEmail = await prisma.attendee.findUnique({
            where: {
                eventId_email: {email,eventId}
            }
        })       

        if(attendeeFromEmail !== null){
            throw new badRequest("Esse email já está cadastrado para este evento");
        }

        const [event, amountOfAttendeesForEvent] = await Promise.all([
            prisma.event.findUnique({
                where:{
                    id: eventId
                }
            }),
            prisma.attendee.count({
                where: {
                    eventId
                }
            })
        ]);

        if(event?.maximumAttendees &&  amountOfAttendeesForEvent >= event?.maximumAttendees ){
            throw new badRequest("Esse evento já atingiu o limite de participantes");
        }

        const uid = new ShortUniqueId();
        const code = uid.formattedUUID('$s2-$r4');

        const attendee = await prisma.attendee.create({
            data: {
                code, 
                name,
                email,
                eventId
            }
        })

        return reply.status(201).send({
            attendeeId: attendee.id,
            code: attendee.code
        })
        
    })
}