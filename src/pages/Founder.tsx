import { useSEO } from '@/lib/seo';
import {
  Award,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  HeartHandshake,
  Lightbulb,
  ShieldCheck,
  Target,
  Users,
} from 'lucide-react';

const founderPhoto = '/images/file_0000000068408208aecee2ee49e66798.jpg';

export default function Founder() {
  useSEO({
    title: 'Founder and CEO | VATTAMS Academy',
    description:
      'Meet Venkatesan Ponniah, Founder and CEO of VATTAMS Academy.',
    path: '/founder',
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-950 text-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-5 py-14 md:py-20">
          <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-10 items-center">
            <div className="order-2 lg:order-1">
              <span className="inline-flex rounded-full bg-white/10 border border-white/15 px-4 py-2 text-xs font-black uppercase tracking-wider text-indigo-200">
                VATTAMS Academy · Founder
              </span>

              <h1 className="text-4xl md:text-6xl font-black leading-tight mt-5">
                Venkatesan Ponniah
              </h1>

              <p className="text-2xl md:text-3xl font-black text-amber-400 mt-3">
                Founder and CEO
              </p>

              <p className="text-xl font-bold text-white mt-1">
                VATTAMS Academy
              </p>

              <p className="text-indigo-100 text-lg leading-relaxed mt-6 max-w-2xl">
                Building an accessible, organised and trustworthy learning
                ecosystem where students can learn, practise, compete and
                achieve.
              </p>

              <blockquote className="border-l-4 border-indigo-400 pl-5 mt-7 text-lg font-bold text-indigo-50">
                “Education is not just about learning; it is about building
                confidence, character and a better tomorrow.”
              </blockquote>
            </div>

            <div className="order-1 lg:order-2 flex justify-center">
              <div className="rounded-[2rem] border-4 border-white/80 bg-white/10 p-2 shadow-2xl max-w-md w-full">
                <img
                  src={founderPhoto}
                  alt="Venkatesan Ponniah, Founder and CEO of VATTAMS Academy"
                  className="w-full aspect-[4/5] object-cover object-top rounded-[1.5rem]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 py-12 md:py-16">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-xs font-black uppercase tracking-wider text-indigo-600">
            Founder&apos;s Success Story
          </p>
          <h2 className="text-3xl md:text-4xl font-black mt-2">
            From an idea to a complete learning vision
          </h2>
          <p className="text-slate-600 text-lg leading-relaxed mt-5">
            Every meaningful journey begins with a simple idea: solve a real
            problem and create something that genuinely helps people.
            Venkatesan Ponniah founded VATTAMS Academy with the vision of
            bringing students, tutors and technology together through one
            dependable learning platform.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-9">
          <StoryCard
            number="01"
            title="The Vision"
            text="Make quality learning more accessible, structured and easier to manage."
          />
          <StoryCard
            number="02"
            title="The Platform"
            text="Build a connected ecosystem for students, tutors, classes, progress and academic support."
          />
          <StoryCard
            number="03"
            title="The Mission Ahead"
            text="Keep improving the platform and create greater opportunities for learners."
          />
        </div>
      </section>

      <section className="bg-white border-y">
        <div className="max-w-6xl mx-auto px-5 py-12 md:py-16">
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-wider text-indigo-600">
              Founder&apos;s Vision
            </p>
            <h2 className="text-3xl md:text-4xl font-black mt-2">
              Education should be accessible, organised and trustworthy.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-9">
            <VisionCard icon={<Users size={21} />} title="Student First" text="Every decision should begin with the learner's needs and success." />
            <VisionCard icon={<BookOpen size={21} />} title="Quality Education" text="Create structured and meaningful learning experiences." />
            <VisionCard icon={<ShieldCheck size={21} />} title="Trust & Safety" text="Build transparent and responsible digital education workflows." />
            <VisionCard icon={<GraduationCap size={21} />} title="Empowering Tutors" text="Support tutors with a professional and transparent platform." />
            <VisionCard icon={<Lightbulb size={21} />} title="Innovation" text="Use technology to simplify and improve the learning journey." />
            <VisionCard icon={<Target size={21} />} title="Outcomes" text="Help students move from learning to confidence and achievement." />
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 py-12">
        <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-7 md:p-10">
          <div className="flex gap-4">
            <HeartHandshake className="text-indigo-600 shrink-0" size={30} />
            <div>
              <h2 className="text-2xl font-black">Founder&apos;s Commitment</h2>
              <p className="text-slate-700 mt-3 text-lg leading-relaxed">
                As the Founder and CEO of VATTAMS Academy, my commitment is to
                continuously improve, listen to learners and tutors, and build
                a platform that creates real value for students and families.
              </p>
              <div className="grid sm:grid-cols-2 gap-3 mt-6">
                <Commitment text="Student-first learning experience" />
                <Commitment text="Transparent tutor processes" />
                <Commitment text="Secure digital workflows" />
                <Commitment text="Continuous platform improvement" />
              </div>

              <div className="mt-8 pt-6 border-t border-indigo-200">
                <p className="text-2xl font-black text-indigo-950">
                  “Together, let&apos;s learn, grow and achieve more.”
                </p>
                <p className="font-black text-indigo-700 mt-3">
                  Venkatesan Ponniah
                </p>
                <p className="text-sm text-slate-600">
                  Founder and CEO · VATTAMS Academy
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-950 text-white">
        <div className="max-w-6xl mx-auto px-5 py-12 text-center">
          <Award className="mx-auto text-indigo-300" size={30} />
          <h2 className="text-2xl md:text-3xl font-black mt-4">
            VATTAMS Academy
          </h2>
          <p className="text-slate-300 mt-2">Learn. Grow. Achieve.</p>
        </div>
      </section>
    </main>
  );
}

function StoryCard({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <article className="bg-white border rounded-3xl p-6">
      <span className="text-3xl font-black text-indigo-100">{number}</span>
      <h3 className="font-black text-xl mt-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed mt-2">{text}</p>
    </article>
  );
}

function VisionCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <article className="rounded-2xl border bg-slate-50 p-5">
      <div className="text-indigo-600">{icon}</div>
      <h3 className="font-black mt-4">{title}</h3>
      <p className="text-sm text-slate-500 mt-1 leading-relaxed">{text}</p>
    </article>
  );
}

function Commitment({ text }: { text: string }) {
  return (
    <div className="bg-white rounded-xl p-3 flex gap-2 items-center">
      <CheckCircle2 size={17} className="text-emerald-600 shrink-0" />
      <span className="text-sm font-bold">{text}</span>
    </div>
  );
}
