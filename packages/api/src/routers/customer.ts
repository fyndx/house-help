import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../index";
import prisma from "@house-help/db";
import { auth } from "@house-help/auth";
import { ORPCError } from "@orpc/client";
import {
	ApprovalStatus,
	UserRole,
} from "@house-help/db/prisma/generated/enums";
import {
	Prisma,
	type Professional,
} from "@house-help/db/prisma/generated/client";
import dayjs from "dayjs";
import { categorizeTimeSlots } from "../utils/booking-util";

export const customerRouter = {
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
						role: UserRole.CUSTOMER,
					},
				});
				if (!signUpData) {
					throw new ORPCError("SIGN_UP_FAILED");
				}
				const customer = await prisma.customer.create({
					data: {
						userId: signUpData.user.id,
					},
				});

				if (!customer) {
					throw new ORPCError("CUSTOMER_CREATION_FAILED");
				}
				return customer;
			} catch (error) {
				console.error(error);
				throw new ORPCError("Failed to create customer");
			}
		}),

	signIn: publicProcedure
		.input(
			z.object({
				email: z.string(),
				password: z.string(),
			}),
		)
		.handler(async ({ input, context, procedure }) => {
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
				const customer = await prisma.customer.findUnique({
					where: {
						userId: signInData.user.id,
					},
					select: {
						id: true,
						addresses: true,
					},
				});
				if (!customer) {
					throw new ORPCError("NOT_FOUND", { message: "Customer not found" });
				}

				return {
					session: signInData,
					customer,
				};
			} catch (error) {
				console.error(error);
				throw new ORPCError("SIGN_IN_FAILED");
			}
		}),
	edit: protectedProcedure
		.input(
			z.object({
				name: z.string().optional(),
				image: z.string().optional(),
			}),
		)
		.handler(async ({ input, context }) => {
			try {
				const customer = await prisma.customer.update({
					where: {
						userId: context.session?.user.id,
					},
					data: {
						user: {
							update: {
								...(input.name !== undefined && { name: input.name }),
								...(input.image !== undefined && { image: input.image }),
							},
						},
					},
				});

				if (!customer) {
					throw new ORPCError("NOT_FOUND", { message: "Customer not found" });
				}
				return customer;
			} catch (error) {
				console.error(error);
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Failed to edit customer",
				});
			}
		}),
	// Addresses
	addAddress: protectedProcedure
		.input(
			z.object({
				address: z.string(),
				landmark: z.string().optional(),
				latitude: z.number(),
				longitude: z.number(),
				label: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			try {
				const customerId = context.customer?.id;
				if (!customerId) {
					throw new ORPCError("NOT_FOUND", { message: "Customer not found" });
				}
				const customerAddress = await prisma.customerAddress.create({
					data: {
						address: input.address,
						landmark: input.landmark,
						latitude: input.latitude,
						longitude: input.longitude,
						label: input.label,
						customerId: customerId,
						// location: Prisma.sql`ST_SetSRID(ST_MakePoint(${input.longitude}, ${input.latitude}), 4326)::geography`,
					},
				});
				// Raw prisma query to set location
				if (customerAddress) {
					await prisma.$executeRaw`
						UPDATE customer_address 
						SET location = ${Prisma.sql`ST_SetSRID(ST_MakePoint(${input.longitude}, ${input.latitude}), 4326)::geography`}
						WHERE _id = ${customerAddress.id}
					`;
				}
				return customerAddress;
			} catch (error) {
				console.error(error);
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Failed to add address",
				});
			}
		}),
	getAddresses: protectedProcedure.handler(async ({ context }) => {
		try {
			const customerId = context.customer?.id;
			if (!customerId) {
				throw new ORPCError("NOT_FOUND", { message: "Customer not found" });
			}
			const addresses = await prisma.customerAddress.findMany({
				where: {
					customerId: customerId,
				},
			});
			return addresses;
		} catch (error) {
			console.error(error);
			throw new ORPCError("GET_ADDRESSES_FAILED");
		}
	}),
	getAddress: protectedProcedure
		.input(
			z.object({
				id: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			try {
				const customerId = context.customer?.id;
				if (!customerId) {
					throw new ORPCError("NOT_FOUND", { message: "Customer not found" });
				}
				const address = await prisma.customerAddress.findFirst({
					where: {
						id: input.id,
						customerId: customerId,
					},
				});
				return address;
			} catch (error) {
				console.error(error);
				throw new ORPCError("GET_ADDRESS_FAILED");
			}
		}),
	editAddress: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				address: z.string().optional(),
				landmark: z.string().optional(),
				latitude: z.number().optional(),
				longitude: z.number().optional(),
				label: z.string().optional(),
			}),
		)
		.handler(async ({ input, context }) => {
			try {
				const customerId = context.customer?.id;
				if (!customerId) {
					throw new ORPCError("NOT_FOUND", { message: "Customer not found" });
				}
				const address = await prisma.customerAddress.update({
					where: {
						id: input.id,
						customerId: customerId,
					},
					data: {
						...(input.address !== undefined && { address: input.address }),
						...(input.landmark !== undefined && { landmark: input.landmark }),
						...(input.latitude !== undefined && { latitude: input.latitude }),
						...(input.longitude !== undefined && {
							longitude: input.longitude,
						}),
						...(input.label !== undefined && { label: input.label }),
					},
				});
				if (!address) {
					throw new ORPCError("NOT_FOUND", { message: "Address not found" });
				}

				// Raw prisma query to set location
				if (input.latitude !== undefined && input.longitude !== undefined) {
					await prisma.$executeRaw`
						UPDATE customer_address
						SET location = ${Prisma.sql`ST_SetSRID(ST_MakePoint(${input.longitude}, ${input.latitude}), 4326)::geography`}
						WHERE _id = ${input.id};
					`;
				}
				return address;
			} catch (error) {
				console.error(error);
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Failed to edit address",
				});
			}
		}),
	deleteAddress: protectedProcedure
		.input(
			z.object({
				id: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			try {
				const customerId = context.customer?.id;
				if (!customerId) {
					throw new ORPCError("NOT_FOUND", { message: "Customer not found" });
				}
				const existingAddress = await prisma.customerAddress.findFirst({
					where: {
						id: input.id,
						customerId: customerId,
					},
				});
				if (!existingAddress) {
					throw new ORPCError("NOT_FOUND", { message: "Address not found" });
				}
				const address = await prisma.customerAddress.delete({
					where: {
						id: input.id,
					},
				});

				return address;
			} catch (error) {
				console.error(error);
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Failed to delete address",
				});
			}
		}),
	// Favorite Professionals
	makeProfessionalFavorite: protectedProcedure
		.input(
			z.object({
				professionalId: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			try {
				const customerId = context.customer?.id;
				if (!customerId) {
					throw new ORPCError("NOT_FOUND", { message: "Customer not found" });
				}
				const favoriteProfessional = await prisma.favoriteProfessional.create({
					data: {
						customerId: customerId,
						professionalId: input.professionalId,
					},
				});
				return favoriteProfessional;
			} catch (error) {
				console.error(error);
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Failed to add favorite professional",
				});
			}
		}),
	getFavoriteProfessionals: protectedProcedure.handler(async ({ context }) => {
		try {
			const customerId = context.customer?.id;
			if (!customerId) {
				throw new ORPCError("NOT_FOUND", { message: "Customer not found" });
			}
			const favoriteProfessionals = await prisma.favoriteProfessional.findMany({
				where: {
					customerId: customerId,
				},
			});
			return favoriteProfessionals;
		} catch (error) {
			console.error(error);
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Failed to get favorite professionals",
			});
		}
	}),
	removeProfessionalFromFavorites: protectedProcedure
		.input(
			z.object({
				id: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			try {
				const customerId = context.customer?.id;
				if (!customerId) {
					throw new ORPCError("NOT_FOUND", { message: "Customer not found" });
				}
				const existingFavoriteProfessional =
					await prisma.favoriteProfessional.findFirst({
						where: {
							id: input.id,
							customerId: customerId,
						},
					});
				if (!existingFavoriteProfessional) {
					throw new ORPCError("NOT_FOUND", {
						message: "Favorite professional not found",
					});
				}
				await prisma.favoriteProfessional.delete({
					where: {
						id: input.id,
					},
				});
				return {
					status: 204,
				};
			} catch (error) {
				console.error(error);
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Failed to remove professional from favorites",
				});
			}
		}),
	// Bookings
	getAvailableSlots: protectedProcedure
		.input(
			z.object({
				serviceId: z.string(),
				location: z.object({
					latitude: z.number(),
					longitude: z.number(),
				}),
			}),
		)
		.handler(async ({ input, context }) => {
			// Find Professionals available for the service in the location
			// Check if the professional is available on the date
			// Response should be based on the date and should contain the slots
			// No need to get professionals, just the slots
			// If date is not provided, get the slots for the next 4 days
			// If date is provided, get the slots for the date
			// Group Response by date and slot
			try {
				const { serviceId, location } = input;
				const DURATIONS = [
					{ hours: 1, label: "1 hour" },
					{ hours: 1.5, label: "1.5 hours" },
					{ hours: 2, label: "2 hours" },
					{ hours: 2.5, label: "2.5 hours" },
					{ hours: 3, label: "3 hours" },
					{ hours: 3.5, label: "3.5 hours" },
					{ hours: 4, label: "4 hours" },
				];
				const { latitude, longitude } = location;
				const customerId = context.customer?.id;
				if (!customerId) {
					throw new ORPCError("NOT_FOUND", { message: "Customer not found" });
				}

				// Find professionals available for the service in the location
				const professionals: Professional[] = await prisma.$queryRaw`
					SELECT p._id, p."isAvailable", p."approvalStatus", p."serviceRadiusKm"  
					FROM professional p
					JOIN professional_service ps ON ps."professionalId" = p._id
					WHERE ps."serviceId" = ${serviceId}
					AND p."approvalStatus" = 'APPROVED'
					AND p."isAvailable" = true
					AND ST_DWithin(
						p."baseLocation", 
						ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography, 
						p."serviceRadiusKm" * 1000 
					);
				`;
				if (professionals.length === 0) {
					return {
						data: [],
					};
				}
				// Loop over next 4 days (today + next 3)
				const results = [];
				for (let dayOffset = 0; dayOffset < 4; dayOffset++) {
					const date = dayjs().add(dayOffset, "day");
					const dayIndex = date.day(); // 0–6

					// 3️⃣ Get all professional availabilities for this weekday
					const availability = await prisma.professionalAvailability.findMany({
						where: {
							professionalId: { in: professionals.map((p) => p._id) },
							dayIndex,
							isAvailable: true,
						},
					});
					if (availability.length === 0) {
						continue;
					}
					// Generate all possible 30-min slots between start–end ranges
					const allSlots = [];
					for (const a of availability) {
						let cursor = dayjs(`${date.format("YYYY-MM-DD")}T${a.startTime}`);
						const end = dayjs(`${date.format("YYYY-MM-DD")}T${a.endTime}`);
						while (
							cursor.add(30, "minute").isBefore(end) ||
							cursor.isSame(end)
						) {
							allSlots.push(cursor.toDate());
							cursor = cursor.add(30, "minute");
						}
					}

					// Remove slots that overlap existing bookings
					const bookedSlots = await prisma.booking.findMany({
						where: {
							professionalId: { in: professionals.map((p) => p._id) },
							status: { in: ["CONFIRMED", "IN_PROGRESS"] },
							scheduledStartTime: {
								gte: date.startOf("day").toDate(),
								lt: date.endOf("day").toDate(),
							},
						},
						select: { scheduledStartTime: true, completedAt: true },
					});

					const availableSlots = allSlots.filter((slot) => {
						const slotStart = dayjs(slot);
						const slotEnd = slotStart.add(30, "minute");
						return !bookedSlots.some((b) => {
							const bStart = dayjs(b.scheduledStartTime);
							const bEnd = b.completedAt
								? dayjs(b.completedAt)
								: bStart.add(2, "hour");
							return slotStart.isBefore(bEnd) && slotEnd.isAfter(bStart);
						});
					});

					// 6️⃣ For each duration, compute valid slots (enough continuous time)
					const durationSlots = [];
					for (const d of DURATIONS) {
						const minMinutes = d.hours * 60;
						const validSlots = availableSlots.filter((slot) => {
							const slotEnd = dayjs(slot).add(minMinutes, "minute");
							// Ensure the entire duration fits within availability
							return availableSlots.some((s) =>
								dayjs(s).isSame(slotEnd.subtract(30, "minute")),
							);
						});
						durationSlots.push({
							...d,
							slots: categorizeTimeSlots(validSlots),
						});
					}

					results.push({
						date: date.format("YYYY-MM-DD"),
						durations: DURATIONS,
						slots: categorizeTimeSlots(availableSlots),
						durationWiseSlots: durationSlots,
					});
				}
				return {
					data: results,
				};
			} catch (error) {
				console.error(error);
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Failed to get service availability",
				});
			}
		}),
};
