import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-white py-12 text-zinc-800">
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl mx-auto px-6 py-3 flex items-center justify-between bg-white/70 backdrop-blur-xl rounded-3xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] transition-all duration-300 hover:bg-white/80 hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.12)]">
        <div className="flex items-center gap-2 group">
          <div className="h-6 w-6 transition-transform duration-300 group-hover:scale-110">
            <Icons.logo className="h-6 w-6 text-blue-600" />
          </div>
          <span className="text-base font-medium">StudyMore</span>
        </div>

        <Button className="text-sm rounded-2xl text-white bg-blue-600 hover:bg-blue-700 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 font-medium px-6 py-2">
          Log in
        </Button>
      </nav>

      <section className="container max-w-6xl mx-auto px-4 pt-40 pb-24 text-center">
        <div className="space-y-6 animate-fade-in">
          <h1 className="text-5xl tracking-tight mb-6 animate-slide-up">
            Learn Smarter,
            <span className="text-blue-500"> Not Harder</span>
          </h1>
          <p className="text-zinc-600 text-xl max-w-2xl mx-auto mb-12 animate-slide-up [animation-delay:200ms]">
            Your AI-powered study companion that turns any learning material
            into interactive study sessions.
          </p>

          <div className="flex items-center justify-center gap-4 animate-slide-up [animation-delay:400ms]">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white text-base font-medium px-8 py-6 rounded-lg shadow-[0_8px_24px_-8px_rgba(37,99,235,0.5)] transition-all duration-300 hover:shadow-[0_12px_28px_-8px_rgba(37,99,235,0.6)] hover:-translate-y-0.5">
              Start Learning for Free →
            </Button>
            <Button
              variant="outline"
              className="text-base text-zinc-700 font-medium px-8 py-6 rounded-lg border-zinc-200 bg-white/50 backdrop-blur-sm hover:bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            >
              Watch Demo
            </Button>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 text-sm text-zinc-500 animate-fade-in [animation-delay:600ms]">
          <span className="flex items-center gap-2 hover:text-zinc-700 transition-colors">
            <Icons.check className="h-4 w-4 text-blue-600" /> No credit card
            required
          </span>
          <span className="flex items-center gap-2 hover:text-zinc-700 transition-colors">
            <Icons.check className="h-4 w-4 text-blue-600" /> 14-day free trial
          </span>
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
            <div className="flex items-center mb-4">
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
            <div className="flex items-center mb-4">
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
            <div className="flex items-center mb-4">
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

      <section className="container max-w-6xl mx-auto px-4 py-24">
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
      </section>

      <footer className="container max-w-7xl mx-auto px-8 py-20 mt-20 bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.08)]">
        <div className="grid grid-cols-5 gap-8">
          <div className="col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <Icons.logo className="h-8 w-8 text-blue-600" />
              <span className="text-[15px] font-medium text-zinc-800">
                StudyMore
              </span>
            </div>
            <p className="text-[13px] text-zinc-600">
              © StudyMore Inc. {new Date().getFullYear()}
            </p>
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
    </main>
  );
}
