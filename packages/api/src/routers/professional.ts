import z from "zod";
import { protectedProcedure, publicProcedure } from "../index";
import { auth } from "@house-help/auth";
import { ORPCError } from "@orpc/client";
import prisma from "@house-help/db";
import {
	DayOfWeek,
	DocumentType,
	Gender,
	UserRole,
} from "@house-help/db/prisma/generated/enums";

export const professionalRouter = {
	signUp: publicProcedure
		.input(
			z.object({
				name: z.string(),
				email: z.email(),
				password: z.string(),
			}),
		)
		.handler(async ({ input }) => {
			try {
				const signUpData = await auth.api.signUpEmail({
					body: {
						name: input.name,
						email: input.email,
						password: input.password,
						role: UserRole.PROFESSIONAL,
					},
				});
				if (!signUpData) {
					throw new ORPCError("SIGN_UP_FAILED");
				}
				const professional = await prisma.professional.create({
					data: {
						userId: signUpData.user.id,
					},
				});
				if (!professional) {
					throw new ORPCError("PROFESSIONAL_CREATION_FAILED");
				}
				return professional;
			} catch (error) {
				console.error(error);
				throw new ORPCError("CREATE_PROFESSIONAL_FAILED");
			}
		}),
	completeProfile: protectedProcedure
		.input(
			z.object({
				maskedAadhaar: z.string(),
				dateOfBirth: z.date(),
				gender: z.enum(Gender),
				profileImage: z.string(),
				bio: z.string(),
				experienceYears: z.number(),
				languages: z.array(z.string()),
				serviceRadiusKm: z.number(),
				baseLatitude: z.number(),
				baseLongitude: z.number(),
				baseLocation: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			try {
				const professionalId = context.professional?.id;
				if (!professionalId) {
					throw new ORPCError("PROFESSIONAL_NOT_FOUND");
				}
				// TODO: add baseLocation to professional
				const professional = await prisma.professional.update({
					where: {
						id: professionalId,
					},
					data: {
						maskedAadhaar: input.maskedAadhaar,
						dateOfBirth: input.dateOfBirth,
						gender: input.gender,
						profileImage: input.profileImage,
						bio: input.bio,
						experienceYears: input.experienceYears,
						languages: input.languages,
						serviceRadiusKm: input.serviceRadiusKm,
						baseLatitude: input.baseLatitude,
						baseLongitude: input.baseLongitude,
					},
				});
				return professional;
			} catch (error) {
				console.error(error);
				throw new ORPCError("COMPLETE_PROFILE_FAILED");
			}
		}),
	signIn: publicProcedure
		.input(
			z.object({
				email: z.email(),
				password: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			try {
				const { headers, response: signInData } = await auth.api.signInEmail({
					body: {
						email: input.email,
						password: input.password,
					},
					returnHeaders: true,
				});
				context.set.headers = Object.fromEntries(headers.entries());
				if (!signInData) {
					throw new ORPCError("SIGN_IN_FAILED");
				}
				const professional = await prisma.professional.findUnique({
					where: {
						userId: signInData.user.id,
					},
				});
				if (!professional) {
					throw new ORPCError("PROFESSIONAL_NOT_FOUND");
				}
				return {
					session: signInData,
					professional,
				};
			} catch (error) {
				console.error(error);
				throw new ORPCError("SIGN_IN_FAILED");
			}
		}),
	edit: protectedProcedure
		.input(
			z.object({
				profileImage: z.string().optional(),
				bio: z.string().optional(),
				experienceYears: z.number().optional(),
				languages: z.array(z.string()).optional(),
				serviceRadiusKm: z.number().optional(),
				baseLatitude: z.number().optional(),
				baseLongitude: z.number().optional(),
			}),
		)
		.handler(async ({ input, context }) => {
			try {
				const professionalId = context.professional?.id;
				if (!professionalId) {
					throw new ORPCError("PROFESSIONAL_NOT_FOUND");
				}
				const professional = await prisma.professional.update({
					where: {
						id: professionalId,
					},
					data: {
						...(input.profileImage !== undefined && {
							profileImage: input.profileImage,
						}),
						...(input.bio !== undefined && { bio: input.bio }),
						...(input.experienceYears !== undefined && {
							experienceYears: input.experienceYears,
						}),
						...(input.languages !== undefined && {
							languages: input.languages,
						}),
						...(input.serviceRadiusKm !== undefined && {
							serviceRadiusKm: input.serviceRadiusKm,
						}),
						...(input.baseLatitude !== undefined && {
							baseLatitude: input.baseLatitude,
						}),
						...(input.baseLongitude !== undefined && {
							baseLongitude: input.baseLongitude,
						}),
					},
				});
				return professional;
			} catch (error) {
				console.error(error);
				throw new ORPCError("EDIT_PROFILE_FAILED");
			}
		}),
	addDocument: protectedProcedure
		.input(
			z.object({
				documentType: z.enum(DocumentType),
				documentUrl: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			try {
				const professionalId = context.professional?.id;
				if (!professionalId) {
					throw new ORPCError("PROFESSIONAL_NOT_FOUND");
				}
				const professionalDocument = await prisma.professionalDocument.create({
					data: {
						documentType: input.documentType,
						documentUrl: input.documentUrl,
						professionalId: professionalId,
					},
				});
				return professionalDocument;
			} catch (error) {
				console.error(error);
				throw new ORPCError("ADD_DOCUMENT_FAILED");
			}
		}),
	getProfile: protectedProcedure.handler(async ({ context }) => {
		try {
			const professionalId = context.professional?.id;
			if (!professionalId) {
				throw new ORPCError("PROFESSIONAL_NOT_FOUND");
			}
			const professional = await prisma.professional.findUnique({
				where: {
					id: professionalId,
				},
			});
			if (!professional) {
				throw new ORPCError("PROFESSIONAL_NOT_FOUND");
			}
			return professional;
		} catch (error) {
			console.error(error);
			throw new ORPCError("GET_PROFILE_FAILED");
		}
	}),
	// Update Duty Status
	updateDutyStatus: protectedProcedure
		.input(
			z.object({
				isAvailable: z.boolean(),
			}),
		)
		.handler(async ({ input, context }) => {
			try {
				const professionalId = context.professional?.id;
				if (!professionalId) {
					throw new ORPCError("PROFESSIONAL_NOT_FOUND");
				}
				const professional = await prisma.professional.update({
					where: {
						id: professionalId,
					},
					data: {
						isAvailable: input.isAvailable,
					},
				});
				return professional;
			} catch (error) {
				console.error(error);
				throw new ORPCError("UPDATE_DUTY_STATUS_FAILED");
			}
		}),
	// Availability
	createAvailability: protectedProcedure
		.input(
			z.object({
				dayOfWeek: z.enum(DayOfWeek),
				startTime: z.string(),
				endTime: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			try {
				const professionalId = context.professional?.id;
				if (!professionalId) {
					throw new ORPCError("PROFESSIONAL_NOT_FOUND");
				}
				const professionalAvailability =
					await prisma.professionalAvailability.create({
						data: {
							dayOfWeek: input.dayOfWeek,
							startTime: input.startTime,
							endTime: input.endTime,
							professionalId: professionalId,
						},
					});
				return professionalAvailability;
			} catch (error) {
				console.error(error);
				throw new ORPCError("ADD_AVAILABILITY_FAILED");
			}
		}),
	getAvailability: protectedProcedure.handler(async ({ context }) => {
		try {
			const professionalId = context.professional?.id;
			if (!professionalId) {
				throw new ORPCError("PROFESSIONAL_NOT_FOUND");
			}

			const professionalAvailability =
				await prisma.professionalAvailability.findMany({
					where: {
						professionalId: professionalId,
					},
				});
			return professionalAvailability;
		} catch (error) {
			console.error(error);
			throw new ORPCError("GET_AVAILABILITY_FAILED");
		}
	}),
	deleteAvailability: protectedProcedure
		.input(
			z.object({
				id: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			try {
				const professionalAvailability =
					await prisma.professionalAvailability.delete({
						where: {
							id: input.id,
						},
					});
				return professionalAvailability;
			} catch (error) {
				console.error(error);
				throw new ORPCError("DELETE_AVAILABILITY_FAILED");
			}
		}),
	updateAvailability: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				dayOfWeek: z.enum(DayOfWeek),
				startTime: z.string(),
				endTime: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			try {
				const professionalAvailability =
					await prisma.professionalAvailability.update({
						where: {
							id: input.id,
						},
						data: {
							dayOfWeek: input.dayOfWeek,
							startTime: input.startTime,
							endTime: input.endTime,
						},
					});
				return professionalAvailability;
			} catch (error) {
				console.error(error);
				throw new ORPCError("UPDATE_AVAILABILITY_FAILED");
			}
		}),
	// CRUD for Services
	createService: protectedProcedure
		.input(
			z.object({
				serviceId: z.string(),
				hourlyRate: z.number(),
			}),
		)
		.handler(async ({ input, context }) => {
			try {
				const professionalId = context.professional?.id;
				if (!professionalId) {
					throw new ORPCError("PROFESSIONAL_NOT_FOUND");
				}
				const professionalService = await prisma.professionalService.create({
					data: {
						professionalId: professionalId,
						serviceId: input.serviceId,
						hourlyRate: input.hourlyRate,
					},
				});
				return professionalService;
			} catch (error) {
				console.error(error);
				throw new ORPCError("CREATE_SERVICE_FAILED");
			}
		}),
	getServices: protectedProcedure.handler(async ({ context }) => {
		try {
			const professionalId = context.professional?.id;
			if (!professionalId) {
				throw new ORPCError("PROFESSIONAL_NOT_FOUND");
			}
			const professionalServices = await prisma.professionalService.findMany({
				where: {
					professionalId: professionalId,
				},
			});
			return professionalServices;
		} catch (error) {
			console.error(error);
			throw new ORPCError("GET_SERVICES_FAILED");
		}
	}),
	deleteService: protectedProcedure
		.input(
			z.object({
				id: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			try {
				const professionalService = await prisma.professionalService.delete({
					where: {
						id: input.id,
					},
				});
				return professionalService;
			} catch (error) {
				console.error(error);
				throw new ORPCError("DELETE_SERVICE_FAILED");
			}
		}),
	updateService: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				hourlyRate: z.number(),
			}),
		)
		.handler(async ({ input, context }) => {
			try {
				const professionalService = await prisma.professionalService.update({
					where: {
						id: input.id,
					},
					data: {
						hourlyRate: input.hourlyRate,
					},
				});
				return professionalService;
			} catch (error) {
				console.error(error);
				throw new ORPCError("UPDATE_SERVICE_FAILED");
			}
		}),
};
