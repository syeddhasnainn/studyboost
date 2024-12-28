import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VerifiedIcon } from "lucide-react";
import { SignInButton } from "@clerk/nextjs";


interface Testimonial {
  name: string;
  username: string;
  content: string;
  avatar: string;
  verified?: boolean;
}

const testimonials: Testimonial[] = [
  {
    name: "Sarah Chen",
    username: "@sarahcodes",
    content: "Just completed my first study session with StudyNinja - the AI explanations are incredible! Already feeling more confident about my upcoming exams ",
    avatar: "/avatars/sarah.png",
    verified: true
  },
  {
    name: "Alex Thompson",
    username: "@alex_learns",
    content: "The way StudyNinja breaks down complex topics is amazing. Got through an entire chapter in half the usual time. This is a game-changer for students!",
    avatar: "/avatars/alex.png"
  },
  {
    name: "Maria Garcia",
    username: "@maria_studies",
    content: "Finally found a study tool that actually works! The personalized study paths are exactly what I needed. 10/10 would recommend to every student.",
    avatar: "/avatars/maria.png",
    verified: true
  },
  {
    name: "James Wilson",
    username: "@james_w",
    content: "Been using StudyNinja for a month now. My grades have improved significantly. The practice exercises are particularly helpful!",
    avatar: "/avatars/james.png"
  },
  {
    name: "Emily Zhang",
    username: "@em_zhang",
    content: "As a teaching assistant, I've recommended StudyNinja to all my students. The way it adapts to each student's learning style is impressive.",
    avatar: "/avatars/emily.png",
    verified: true
  },
  {
    name: "David Kumar",
    username: "@dave_k",
    content: "The instant feedback feature is brilliant! It's like having a personal tutor available 24/7. Absolutely worth every penny.",
    avatar: "/avatars/david.png"
  }
];

export default async function Page() {
  // const signinUrl = await getSignInUrl();
  // const { user } = await withAuth();

  return (

    <main className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-white py-8 text-zinc-800">
      <div className="max-w-6xl mx-auto px-12">
      <nav className="fixed left-1/2 -translate-x-1/2 w-[90%] max-w-2xl mx-auto px-6 py-3 flex items-center justify-between bg-white/50 backdrop-blur-xl rounded-3xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] transition-all duration-300 hover:bg-white/80 hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.12)] z-50">
        <div className="flex items-center gap-2 group">
          <div className="h-6 w-6 transition-transform duration-300 group-hover:scale-110">
            <Icons.logo className="h-6 w-6 text-blue-600" />
          </div>
          <span className="text-base font-medium">StudyBoost</span>
        </div>
        {/* {user ? (
          <div>
            <Link href={"/chat"} className="text-sm rounded-2xl text-white bg-blue-600 hover:bg-blue-700 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 font-medium px-6 py-2">
              Go to Chat
            </Link>
          </div>



        ) : */}
         {/* <Link href={"/login"} className="text-sm rounded-2xl text-white bg-blue-600 hover:bg-blue-700 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 font-medium px-6 py-2"> */}
          {/* Log in */}
          <div className="text-sm rounded-2xl text-white bg-blue-600 hover:bg-blue-700 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 font-medium px-6 py-2">
          <SignInButton />

          </div>
          
        {/* </Link> */}
        {/* } */}
      </nav>

      <section className="container max-w-6xl mx-auto px-4 pt-40 pb-24 text-center">
        <div className="space-y-6 animate-fade-in">
          <h1 className="text-5xl tracking-tight mb-6 animate-slide-up">
            Learn Smarter,
            <span className="text-blue-500"> Not Harder</span>
          </h1>
          <p className="text-zinc-600 text-xl max-w-2xl mx-auto mb-8">
            Enhance your learning experience with AI-powered study tools, personalized study paths, and interactive practice exercises.
          </p>
          <div className="flex justify-center gap-4">
            <Button className="text-lg rounded-2xl text-white bg-blue-600 hover:bg-blue-700 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 font-medium px-8 py-6">
              Get Started
            </Button>
            <Button variant="outline" className="text-lg rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 font-medium px-8 py-6">
              Learn More
            </Button>
          </div>
        </div>
      </section>



      <section className="container max-w-6xl mx-auto px-16 py-24 text-center bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.08)]">
        <h2 className="text-blue-600 text-sm font-medium mb-12">
          AI-Powered Learning
        </h2>
        <h3 className="text-4xl mb-20 text-zinc-800">
          Transform how you study with
          <span className="block">intelligent learning tools</span>
        </h3>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="group relative p-6 bg-white/80 rounded-2xl transition-all duration-300 hover:-translate-y-1 border border-white/20 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.16)]">
            <div className="flex items-center justify-center mb-4">
              <div className="p-2.5 rounded-lg   transition-colors">
                <Icons.brain className="h-5 w-5 text-blue-600" />
              </div>
              <h4 className="text-xl text-zinc-800">AI Study Assistant</h4>
            </div>
            <p className="text-md text-zinc-600 leading-relaxed">
              Ask questions, get explanations, and receive instant feedback on
              any topic. Like having a tutor available 24/7.
            </p>
          </div>

          <div className="group relative p-6 bg-white/80 rounded-2xl transition-all duration-300 hover:-translate-y-1 border border-white/20 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.16)]">
            <div className="flex items-center mb-4 justify-center">
              <div className="p-2.5 rounded-lg   transition-colors">
                <Icons.document className="h-5 w-5 text-blue-600" />
              </div>
              <h4 className="text-xl text-zinc-800">Smart Summaries</h4>
            </div>
            <p className="text-md text-zinc-600 leading-relaxed">
              Upload any document and get instant summaries, key points, and
              study guides tailored to your learning style.
            </p>
          </div>

          <div className="group relative p-6 bg-white/80 rounded-2xl transition-all duration-300 hover:-translate-y-1 border border-white/20 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.16)]">
            <div className="flex items-center mb-4 justify-center">
              <div className="p-2.5 rounded-lg   transition-colors">
                <Icons.target className="h-5 w-5 text-blue-600" />
              </div>
              <h4 className="text-xl text-zinc-800">Adaptive Practice</h4>
            </div>
            <p className="text-md text-zinc-600 leading-relaxed">
              AI-generated quizzes and exercises that adapt to your progress,
              focusing on areas where you need the most help.
            </p>
          </div>
        </div>
      </section>


      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl  text-blue-600 text-center mb-4">
            Serving students worldwide
          </h2>
          <p className="text-gray-600 text-center mb-12 text-lg">
            Join thousands of students who are already learning smarter
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={testimonial.avatar} />
                    <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-sm">{testimonial.name}</span>
                      {testimonial.verified && (
                        <VerifiedIcon className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{testimonial.username}</div>
                  </div>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {testimonial.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* <section className="container max-w-6xl mx-auto px-4 py-24">
        <h2 className="text-blue-600 text-sm font-medium text-center mb-12">
          Pricing
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="relative p-8 bg-white/70 backdrop-blur-xl rounded-[1.5rem] border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_0_rgba(0,0,0,0.12)]">
            <h3 className="text-xl font-medium mb-2">Free</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-zinc-500">/ month</span>
            </div>
            <p className="text-zinc-400 mb-8">
              Start your learning journey here.
            </p>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Icons.check className="h-5 w-5 text-blue-600 mt-0.5" />
                <span className="text-zinc-600">
                  1 space to organize your content
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Icons.check className="h-5 w-5 text-blue-600 mt-0.5" />
                <span className="text-zinc-600">
                  5 messages per day with the AI co-pilot
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Icons.check className="h-5 w-5 text-blue-600 mt-0.5" />
                <span className="text-zinc-600">
                  Add up to 3 YouTube videos or PDFs per week
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Icons.check className="h-5 w-5 text-blue-600 mt-0.5" />
                <span className="text-zinc-600">
                  Add up to 1 PDF, up to 20 MB in size
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Icons.check className="h-5 w-5 text-blue-600 mt-0.5" />
                <span className="text-zinc-600">
                  Record up to 1 lecture per month
                </span>
              </li>
            </ul>

            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-6 transition-all duration-300 hover:-translate-y-0.5">
              Get Started
            </Button>
          </div>

          <div className="relative p-8 bg-white/90 backdrop-blur-xl rounded-[1.5rem] border border-blue-100 shadow-[0_8px_32px_-8px_rgba(37,99,235,0.25)] hover:shadow-[0_12px_32px_-8px_rgba(37,99,235,0.35)] transition-all duration-300 hover:-translate-y-1 scale-105">
            <h3 className="text-xl font-medium mb-2">
              Pro <span className="text-sm text-zinc-500">(annual)</span>
            </h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-bold">$8</span>
              <span className="text-zinc-500">/ month</span>
            </div>
            <p className="text-zinc-600 mb-8">
              Accelerate your learning journey.
            </p>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Icons.check className="h-5 w-5 text-blue-600 mt-0.5" />
                <span className="text-zinc-600">
                  Unlimited spaces to organize your content
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Icons.check className="h-5 w-5 text-blue-600 mt-0.5" />
                <span className="text-zinc-600">
                  Unlimited multimodal messages with the AI co-pilot
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Icons.check className="h-5 w-5 text-blue-600 mt-0.5" />
                <span className="text-zinc-600">
                  Add Unlimited YouTube links or PDFs
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Icons.check className="h-5 w-5 text-blue-600 mt-0.5" />
                <span className="text-zinc-600">
                  Upload PDFs, each up to 50 MB in size
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Icons.check className="h-5 w-5 text-blue-600 mt-0.5" />
                <span className="text-zinc-600">
                  Record up to 40 lectures per month
                </span>
              </li>
            </ul>

            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-6">
              Choose Pro
            </Button>
          </div>

          <div className="relative p-8 bg-white/70 backdrop-blur-xl rounded-[1.5rem] border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_0_rgba(0,0,0,0.12)]">
            <h3 className="text-xl font-medium mb-2">
              Core <span className="text-sm text-zinc-500">(annual)</span>
            </h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-bold">$4</span>
              <span className="text-zinc-500">/ month</span>
            </div>
            <p className="text-zinc-600 mb-8">Learn at the highest level.</p>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Icons.check className="h-5 w-5 text-blue-600 mt-0.5" />
                <span className="text-zinc-600">
                  3 spaces to organize your content
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Icons.check className="h-5 w-5 text-blue-600 mt-0.5" />
                <span className="text-zinc-600">
                  15 multimodal messages per day with the AI co-pilot
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Icons.check className="h-5 w-5 text-blue-600 mt-0.5" />
                <span className="text-zinc-600">
                  Add up to 10 YouTube videos or PDFs per week
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Icons.check className="h-5 w-5 text-blue-600 mt-0.5" />
                <span className="text-zinc-600">
                  Upload PDFs, each up to 20 MB in size
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Icons.check className="h-5 w-5 text-blue-600 mt-0.5" />
                <span className="text-zinc-600">
                  Record up to 10 lectures per month
                </span>
              </li>
            </ul>

            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-6 transition-all duration-300 hover:-translate-y-0.5">
              Choose Core
            </Button>
          </div>
        </div>
      </section> */}

      <footer className="container max-w-7xl mx-auto px-8 py-20 mt-20 bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.08)]">
        <div className="grid grid-cols-5 gap-8">
          <div className="col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <Icons.logo className="h-8 w-8 text-blue-600" />
              <span className="text-[15px] font-medium text-zinc-800">
                StudyBoost
              </span>
            </div>
            <p className="text-[13px] text-zinc-600">&copy; StudyBoost Inc. {new Date().getFullYear()}</p>
          </div>

          <div className="col-span-1">
            <h4 className="text-[15px] font-medium text-zinc-800 mb-4">
              Platform
            </h4>
            <div className="flex flex-col gap-3">
              <Link
                href="/create-account"
                className="text-[13px] text-zinc-600 hover:text-zinc-800 transition-colors"
              >
                Create an Account
              </Link>
              <Link
                href="/products"
                className="text-[13px] text-zinc-600 hover:text-zinc-800 transition-colors"
              >
                Products & Subscriptions
              </Link>
              <Link
                href="/donations"
                className="text-[13px] text-zinc-600 hover:text-zinc-800 transition-colors"
              >
                Donations
              </Link>
              <Link
                href="/funding"
                className="text-[13px] text-zinc-600 hover:text-zinc-800 transition-colors"
              >
                Issue Funding
              </Link>
            </div>
          </div>

          <div className="col-span-1">
            <h4 className="text-[15px] font-medium text-zinc-800 mb-4">
              Company
            </h4>
            <div className="flex flex-col gap-3">
              <Link
                href="/careers"
                className="text-[13px] text-zinc-600 hover:text-zinc-800 transition-colors"
              >
                Careers
              </Link>
              <Link
                href="/blog"
                className="text-[13px] text-zinc-600 hover:text-zinc-800 transition-colors"
              >
                Blog
              </Link>
              <Link
                href="/brand"
                className="text-[13px] text-zinc-600 hover:text-zinc-800 transition-colors"
              >
                Brand Assets
              </Link>
              <Link
                href="/terms"
                className="text-[13px] text-zinc-600 hover:text-zinc-800 transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/privacy"
                className="text-[13px] text-zinc-600 hover:text-zinc-800 transition-colors"
              >
                Privacy Policy
              </Link>
            </div>
          </div>

          <div className="col-span-1">
            <h4 className="text-[15px] font-medium text-zinc-800 mb-4">
              Community
            </h4>
            <div className="flex flex-col gap-3">
              <Link
                href="/discord"
                className="text-[13px] text-zinc-600 hover:text-zinc-800 transition-colors"
              >
                Join our Discord
              </Link>
              <Link
                href="/github"
                className="text-[13px] text-zinc-600 hover:text-zinc-800 transition-colors"
              >
                GitHub
              </Link>
              <Link
                href="/twitter"
                className="text-[13px] text-zinc-600 hover:text-zinc-800 transition-colors"
              >
                X / Twitter
              </Link>
            </div>
          </div>

          <div className="col-span-1">
            <h4 className="text-[15px] font-medium text-zinc-800 mb-4">
              Support
            </h4>
            <div className="flex flex-col gap-3">
              <Link
                href="/docs"
                className="text-[13px] text-zinc-600 hover:text-zinc-800 transition-colors"
              >
                Docs
              </Link>
              <Link
                href="/faq"
                className="text-[13px] text-zinc-600 hover:text-zinc-800 transition-colors"
              >
                FAQ
              </Link>
              <Link
                href="/contact"
                className="text-[13px] text-zinc-600 hover:text-zinc-800 transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
      </div>
      
    </main>
  );
}
