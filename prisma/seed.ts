import { EyeTestType, PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
	// 1) Ensure demo user exists
	const email = "demo@aieyecare.app";
	const passwordHash = await bcrypt.hash("password123", 10);

	await prisma.user.upsert({
		where: { email },
		update: {},
		create: {
			fullname: "Demo User",
			email,
			passwordHash,
			age: 28,
			eyeConditions: [],
		},
	});

	// 2) Seed Exercises
	const exercises = [
		{
			title: "Blinking Exercise",
			description: "Reduce eye strain and improve lubrication by controlled blinking cycles.",
			tags: ["relaxation", "dry-eye"],
			config: {
				type: "relaxation",
				durationMin: 2,
				difficulty: "beginner",
				instructions: [
					"Sit comfortably and relax your shoulders.",
					"Blink normally for 30 seconds.",
					"Close your eyes gently for 5 seconds, then open.",
					"Repeat the cycle for the full duration.",
				],
				benefits: ["Reduces dryness", "Relaxes eye muscles"],
			},
		},
		{
			title: "Focus Shifting",
			description: "Strengthen focusing muscles by alternating between near and far focus.",
			tags: ["focus", "near-far"],
			config: {
				type: "focus",
				durationMin: 3,
				difficulty: "intermediate",
				instructions: [
					"Hold your thumb 20cm in front of your eyes.",
					"Focus on your thumb for 10 seconds.",
					"Shift focus to an object 3–6 meters away for 10 seconds.",
					"Alternate focus for the full duration.",
				],
				benefits: ["Improves accommodation", "Reduces digital eye strain"],
			},
		},
		{
			title: "Eye Rotation",
			description: "Improve ocular muscle flexibility with circular eye movements.",
			tags: ["mobility", "warmup"],
			config: {
				type: "tracking",
				durationMin: 2,
				difficulty: "beginner",
				instructions: [
					"Look up, then slowly rotate your eyes clockwise for 10 reps.",
					"Repeat counter‑clockwise for 10 reps.",
					"Keep movements smooth. Do not strain.",
				],
				benefits: ["Enhances range of motion", "Relieves tension"],
			},
		},
		{
			title: "20‑20‑20 Rule",
			description: "Every 20 minutes, look at something 20 feet away for 20 seconds.",
			tags: ["habit", "relief"],
			config: {
				type: "relaxation",
				durationMin: 1,
				difficulty: "beginner",
				instructions: [
					"Set a timer reminder every 20 minutes.",
					"Look at a distant object (6m+) for 20 seconds.",
					"Blink gently while focusing far.",
				],
				benefits: ["Breaks near‑focus fatigue", "Prevents headaches"],
			},
		},
	];

	for (const ex of exercises) {
		const existing = await prisma.exercise.findFirst({ where: { title: ex.title } });
		if (existing) {
			await prisma.exercise.update({ where: { id: existing.id }, data: { description: ex.description, tags: ex.tags, config: ex.config } });
		} else {
			await prisma.exercise.create({ data: ex });
		}
	}

	// 3) Seed Eye Test Templates
	const tests = [
		{
			name: "Snellen Visual Acuity",
			type: EyeTestType.VISUAL_ACUITY,
			config: {
				chart: "snellen",
				distanceMeters: 3,
				lines: ["E", "FP", "TOZ", "LPED", "PECFD", "EDFCZP", "FELOPZD"],
				scoring: { method: "smallest_line_correct", perLine: 10 },
				instructions: [
					"Stand or sit 3 meters away.",
					"Cover one eye at a time.",
					"Read the smallest line you can.",
				],
			},
		},
		{
			name: "Ishihara Color Vision",
			type: EyeTestType.COLOR_BLINDNESS,
			config: {
				plates: [
					{ number: 12, answer: 12 },
					{ number: 8, answer: 8 },
					{ number: 6, answer: 6 },
					{ number: 29, answer: 29 },
					{ number: 57, answer: 57 },
				],
				instructions: [
					"Identify the number on each plate.",
					"Do not spend more than 3 seconds per plate.",
				],
				scoring: { method: "num_correct", max: 5 },
			},
		},
		{
			name: "Astigmatism Dial",
			type: EyeTestType.ASTIGMATISM,
			config: {
				pattern: "fan_and_block",
				questions: [
					"Do some lines appear darker than others?",
					"Do the lines blur or distort?",
				],
				instructions: [
					"Cover one eye at a time.",
					"Stare at the center of the fan lines.",
					"Report any darker sectors or distortion.",
				],
				scoring: { method: "subjective", scale: ["none", "mild", "moderate", "severe"] },
			},
		},
		{
			name: "Contrast Sensitivity (Pelli‑Robson)",
			type: EyeTestType.CONTRAST_SENSITIVITY,
			config: {
				stimulus: "letters",
				levels: [100, 50, 25, 12.5, 6.25, 3.12],
				instructions: [
					"Read letters as they fade in contrast.",
					"Stop when you can no longer reliably identify letters.",
				],
				scoring: { method: "highest_level_identified" },
			},
		},
	];

	for (const t of tests) {
		const existing = await prisma.eyeTestTemplate.findFirst({ where: { name: t.name } });
		if (existing) {
			await prisma.eyeTestTemplate.update({ where: { id: existing.id }, data: { type: t.type, config: t.config } });
		} else {
			await prisma.eyeTestTemplate.create({ data: t });
		}
	}

	// 4) Seed Education Resources
	/*
	const educationResources = [
		{
			id: "1",
			type: "book",
			title: "The Eye Book: A Complete Guide to Eye Disorders and Health",
			author: "Dr. Gary H. Cassel",
			summary: "A comprehensive guide for patients on a wide range of eye conditions, from common issues to more serious diseases.",
			coverImageUrl: "https://images-na.ssl-images-amazon.com/images/I/71gG+ep21OL.jpg",
			url: "https://www.amazon.com/Eye-Book-Complete-Disorders-Health/dp/080189959X",
			publishedAt: new Date("2010-05-17T00:00:00.000Z"),
		},
		{
			id: "2",
			type: "journal",
			title: "Digital eye strain: prevalence, measurement and amelioration",
			author: "Coles-Brennan C, Sulley A, Young G",
			summary: "This review summarises the latest evidence for the prevalence of digital eye strain, its measurement and management with spectacle and contact lenses.",
			url: "https://pubmed.ncbi.nlm.nih.gov/30134989/",
			publishedAt: new Date("2019-01-01T00:00:00.000Z"),
		},
		{
			id: "3",
			type: "article",
			title: "How to Protect Your Eyes",
			author: "American Academy of Ophthalmology",
			summary: "Simple tips to keep your eyes healthy, including diet, exercise, and when to see a doctor.",
			coverImageUrl: "https://www.aao.org/image.axd?id=b26e98f4-a55a-4248-825a-37c25f4648b2&t=637795356195700000",
			url: "https://www.aao.org/eye-health/tips-prevention/how-to-protect-your-eyes",
			publishedAt: new Date("2022-05-20T00:00:00.000Z"),
			content: `
# How to Protect Your Eyes

Keeping your eyes healthy is vital. Here are some simple tips you can follow.

## 1. Eat a Healthy, Balanced Diet
Your eyes need a variety of vitamins and nutrients. Include plenty of fruits and vegetables, particularly leafy greens like spinach and kale. Fish high in omega-3 fatty acids, like salmon and tuna, are also great for your eyes.

## 2. Maintain a Healthy Weight
Being overweight or obese increases your risk of developing diabetes. Diabetes can lead to diabetic retinopathy or glaucoma.

## 3. Get Regular Exercise
Exercise can help to prevent or control diabetes, high blood pressure, and high cholesterol. These diseases can lead to some eye or vision problems. So if you exercise regularly, you can lower your risk of getting these eye and vision problems.

## 4. Wear Sunglasses
Sun exposure can damage your eyes and raise your risk of cataracts and age-related macular degeneration. Protect your eyes by using sunglasses that block out 99 to 100 percent of both UV-A and UV-B radiation.

## 5. Follow the 20-20-20 Rule
If you spend a lot of time using a computer, you can forget to blink your eyes and your eyes can get tired. To reduce eyestrain, try the 20-20-20 rule: Every 20 minutes, look away about 20 feet in front of you for 20 seconds.

*This is a summary for demonstration purposes.*`,
		},
	];

	for (const resource of educationResources) {
		await prisma.educationResource.upsert({ where: { id: resource.id }, update: resource, create: resource });
	}*/

	console.log("Seed completed. Demo user:", email, "password: password123. Education resources seeded.");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
