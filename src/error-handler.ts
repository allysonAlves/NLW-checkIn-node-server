import { FastifyInstance } from "fastify"
import { badRequest } from "./routes/_errors/bad-request";
import { ZodError } from "zod";

type FastifyErrorHandler = FastifyInstance['errorHandler'];

export const errorHandler: FastifyErrorHandler = (error, request,reply) => {
    const { validation, validationContext } = error;

    if(error instanceof ZodError) {
        return reply.status(400).send({
            message: `Error durante a validação`,
            errors: error.flatten().fieldErrors
        })
    }

    if(error instanceof badRequest){
        return reply.status(400).send({message: error.message})
    }

    return reply.status(500).send({message: 'Internal Server Error!'})
}