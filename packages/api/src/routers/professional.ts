import { z } from "zod";
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
					throw new ORPCError("BAD_REQUEST", {
						message: "Invalid sign up data",
					});
				}
				const professional = await prisma.professional.create({
					data: {
						userId: signUpData.user.id,
					},
				});
				if (!professional) {
					throw new ORPCError("INTERNAL_SERVER_ERROR", {
						message: "Failed to create professional",
					});
				}
				return professional;
			} catch (error) {
				console.error(error);
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Failed to create professional",
				});
			}
		}),
	completeProfile: protectedProcedure
		.input(
			z.object({
				maskedAadhaar: z.string(),
				dateOfBirth: z.coerce.date(),
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
					throw new ORPCError("NOT_FOUND", {
						message: "Professional not found",
					});
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
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Failed to complete profile",
				});
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
					throw new ORPCError("BAD_REQUEST", {
						message: "Invalid sign in data",
					});
				}
				const professional = await prisma.professional.findUnique({
					where: {
						userId: signInData.user.id,
					},
				});
				if (!professional) {
					throw new ORPCError("NOT_FOUND", {
						message: "Professional not found",
					});
				}
				return {
					session: signInData,
					professional,
				};
			} catch (error) {
				console.error(error);
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Failed to sign in",
				});
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
					throw new ORPCError("NOT_FOUND", {
						message: "Professional not found",
					});
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
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Failed to edit profile",
				});
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
					throw new ORPCError("NOT_FOUND", {
						message: "Professional not found",
					});
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
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Failed to add document",
				});
			}
		}),
	getProfile: protectedProcedure.handler(async ({ context }) => {
		try {
			const professionalId = context.professional?.id;
			if (!professionalId) {
				throw new ORPCError("NOT_FOUND", {
					message: "Professional not found",
				});
			}
			const professional = await prisma.professional.findUnique({
				where: {
					id: professionalId,
				},
			});
			if (!professional) {
				throw new ORPCError("NOT_FOUND", {
					message: "Professional not found",
				});
			}
			return professional;
		} catch (error) {
			console.error(error);
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Failed to get profile",
			});
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
					throw new ORPCError("NOT_FOUND", {
						message: "Professional not found",
					});
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
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Failed to update duty status",
				});
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
					throw new ORPCError("NOT_FOUND", {
						message: "Professional not found",
					});
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
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Failed to add availability",
				});
			}
		}),
	getAvailability: protectedProcedure.handler(async ({ context }) => {
		try {
			const professionalId = context.professional?.id;
			if (!professionalId) {
				throw new ORPCError("NOT_FOUND", {
					message: "Professional not found",
				});
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
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Failed to get availability",
			});
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
				const professionalId = context.professional?.id;
				if (!professionalId) {
					throw new ORPCError("NOT_FOUND", {
						message: "Professional not found",
					});
				}
				const professionalAvailability =
					await prisma.professionalAvailability.delete({
						where: {
							id: input.id,
							professionalId: professionalId,
						},
					});
				return professionalAvailability;
			} catch (error) {
				console.error(error);
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Failed to delete availability",
				});
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
				const professionalId = context.professional?.id;
				if (!professionalId) {
					throw new ORPCError("NOT_FOUND", {
						message: "Professional not found",
					});
				}
				const professionalAvailability =
					await prisma.professionalAvailability.update({
						where: {
							id: input.id,
							professionalId: professionalId,
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
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Failed to update availability",
				});
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
					throw new ORPCError("NOT_FOUND", {
						message: "Professional not found",
					});
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
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Failed to create service",
				});
			}
		}),
	getServices: protectedProcedure.handler(async ({ context }) => {
		try {
			const professionalId = context.professional?.id;
			if (!professionalId) {
				throw new ORPCError("NOT_FOUND", {
					message: "Professional not found",
				});
			}
			const professionalServices = await prisma.professionalService.findMany({
				where: {
					professionalId: professionalId,
				},
			});
			return professionalServices;
		} catch (error) {
			console.error(error);
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Failed to get services",
			});
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
				const professionalId = context.professional?.id;
				if (!professionalId) {
					throw new ORPCError("NOT_FOUND", {
						message: "Professional not found",
					});
				}
				const professionalService = await prisma.professionalService.delete({
					where: {
						id: input.id,
						professionalId: professionalId,
					},
				});
				return professionalService;
			} catch (error) {
				console.error(error);
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Failed to delete service",
				});
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
				const professionalId = context.professional?.id;
				if (!professionalId) {
					throw new ORPCError("NOT_FOUND", {
						message: "Professional not found",
					});
				}
				const professionalService = await prisma.professionalService.update({
					where: {
						id: input.id,
						professionalId: professionalId,
					},
					data: {
						hourlyRate: input.hourlyRate,
					},
				});
				return professionalService;
			} catch (error) {
				console.error(error);
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Failed to update service",
				});
			}
		}),
};
