// src/modules/exercises/exercises.controller.ts
import { PrismaClient } from "@prisma/client";
import { Response } from "express";
import { AuthedRequest } from "../../middleware/auth";
const prisma = new PrismaClient();

export const getEducations = async (req: AuthedRequest, res: Response) => {
  // const exercises = await prisma.exercise.findMany();
  // res.json(exercises);
  res.json([{
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
		}])
};