import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import { badRequest } from "./_errors/bad-request";

export async function checkIn(app: FastifyInstance){
    app
    .withTypeProvider<ZodTypeProvider>()
    .get('/attendees/:code/check-in', {
        schema: {
            summary: 'check-in an attendee',
            tags: ['check-in'],
            params: z.object({
                code: z.string()
            }),
            response: {
                201: z.null()
            }
        }
    },
    async (request, reply) => {
        const { code } = request.params;

        const attendee = await prisma.attendee.findUnique({
            where: {
                code
            }
        })

        if(attendee === null) {
            throw new badRequest('Participante não encontrado')
        }

        const attendeeCheckIn = await prisma.checkIn.findUnique({
            where: {
                attendeeId: attendee.id
            }
        })

        if(attendeeCheckIn !== null){
            throw new badRequest("participante já realizou o check in")
        }

        await prisma.checkIn.create({
            data: {
                attendeeId: attendee.id
            }
        })

        return reply.status(201).send()
    })
}