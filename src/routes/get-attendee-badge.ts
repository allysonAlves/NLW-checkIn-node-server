import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../lib/prisma";
import { z } from "zod";

import { badRequest } from "./_errors/bad-request";

export async function getAttendeeBadge(app: FastifyInstance){
    app
    .withTypeProvider<ZodTypeProvider>()
    .get('/attendees/:code/badge', {
        schema: {
            summary: 'Get attendee badge',
            tags: ['attendees'],
            params: z.object({
                code: z.string()
            }),
            response: {
                200: z.object({
                    badge: z.object({
                        code: z.string(),
                        name: z.string(),
                        email: z.string().email(),
                        eventTitle: z.string(),
                        checkInURL: z.string().url(),                        
                    })
                })
            }
        }
    },
    async (request, response) => {
        const { code } = request.params;

        const attendee = await prisma.attendee.findUnique({
            select: {
                code: true,
                name: true,
                email: true,
                event: {
                    select: {
                        title: true
                    }
                }
            },
            where: {
                code
            }
        })

        if(!attendee){
            throw new badRequest("participante não encontrado");
        }

        const baseURL = `${request.protocol}://${request.hostname}`

        const checkInURL = new URL(`/attendees/${code}/check-in`, baseURL);

        return response.send({ 
            badge: {
                code: attendee.code,
                name: attendee.name,
                email: attendee.email,
                eventTitle: attendee.event.title,
                checkInURL: checkInURL.toString()
            } 
        })
    })    
}