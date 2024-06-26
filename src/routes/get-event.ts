import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import { badRequest } from "./_errors/bad-request";

export async function getEvent(app: FastifyInstance){

    app
    .withTypeProvider<ZodTypeProvider>()
    .get('/events/:eventId', {
        schema: {
            summary: 'Get an event',
            tags: ['events'],
            params:  z.object({
                eventId: z.string().uuid(),
            }),
            response: {
                200: z.object({                    
                    event: z.object({
                        id: z.string().uuid(),
                        title: z.string(),
                        details: z.string().nullable(),
                        slug: z.string(),
                        maximumAttendees: z.number().int().nullable(),
                        attendeesAmount: z.number().int(),
                    })                   
                }) 
            }
        }
    }, async (request, reply) => {
        const { eventId } = request.params;

        const event = await prisma.event.findUnique({
            select: {
                id: true,
                title: true,
                details: true,
                slug: true,
                maximumAttendees: true,
                _count: {
                    select: {
                        Attendee: true
                    }
                }
            },
            where: {
                id: eventId
            }
        })

        if(event == null){
            throw new badRequest("Evento não encontrado")
        }

        return  reply.send({ 
            event : {
                id: event.id,
                title: event.title,
                details: event.details,
                slug: event.slug,
                maximumAttendees: event.maximumAttendees,
                attendeesAmount: event._count.Attendee

            }
        })
    })

}