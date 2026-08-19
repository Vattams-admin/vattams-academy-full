import { Award, BookOpen, CheckCircle2, GraduationCap, HeartHandshake, Lightbulb, ShieldCheck, Users } from 'lucide-react';

export default function AcademyFounderPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-5 py-16 md:py-24">
          <span className="inline-flex rounded-full bg-white/10 border border-white/15 px-4 py-2 text-xs font-black uppercase tracking-wider">
            Founder · VATTAMS Academy
          </span>
          <h1 className="text-4xl md:text-6xl font-black leading-tight mt-5 max-w-4xl">
            Building accessible, trustworthy learning for every student.
          </h1>
          <p className="text-indigo-100 text-lg md:text-xl mt-5 max-w-2xl leading-relaxed">
            VATTAMS Academy is built with a simple purpose: connect students
            with quality tutors through a transparent, technology-driven
            learning platform.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 py-12 md:py-16">
        <div className="grid lg:grid-cols-[0.75fr_1.25fr] gap-8 items-start">
          <div className="bg-white border rounded-3xl p-7">
            <div className="w-28 h-28 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center mx-auto">
              <GraduationCap size={48} />
            </div>
            <div className="text-center mt-5">
              <p className="text-xs font-black uppercase tracking-wider text-indigo-600">Founder</p>
              <h2 className="text-2xl font-black mt-1">Venkatesan Ponniah</h2>
              <p className="text-slate-500 mt-1">Founder, VATTAMS Academy</p>
            </div>
            <p className="border-t mt-6 pt-5 text-sm text-slate-600 leading-relaxed">
              A technology-focused education initiative designed to make
              structured tuition, tutor access and student support simpler.
            </p>
          </div>

          <div>
            <span className="text-xs font-black uppercase tracking-wider text-indigo-600">
              Founder&apos;s vision
            </span>
            <h2 className="text-3xl md:text-4xl font-black mt-2">
              Education should be accessible, organised and trustworthy.
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed mt-5">
              VATTAMS Academy aims to create a learning ecosystem where
              students can discover suitable tutors, attend structured
              classes, track progress and receive meaningful academic support.
            </p>
            <p className="text-slate-600 text-lg leading-relaxed mt-4">
              The goal is to build a dependable platform where students,
              parents, tutors and administrators can work together with clarity.
            </p>
            <blockquote className="mt-7 border-l-4 border-indigo-600 bg-white rounded-r-2xl p-5">
              <p className="text-xl font-black">
                “Build technology that earns trust, and education that creates opportunity.”
              </p>
              <footer className="text-sm text-slate-500 mt-2">— Founder, VATTAMS Academy</footer>
            </blockquote>
          </div>
        </div>
      </section>

      <section className="bg-white border-y">
        <div className="max-w-6xl mx-auto px-5 py-12">
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-wider text-indigo-600">Our vision</p>
            <h2 className="text-3xl font-black mt-2">A complete learning ecosystem</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <Card icon={<BookOpen size={21} />} title="Better Learning" text="Structured tuition and learning support for students." />
            <Card icon={<Users size={21} />} title="Tutor Network" text="A transparent platform for tutors and students to connect." />
            <Card icon={<ShieldCheck size={21} />} title="Trust & Safety" text="Role-based access, verification and secure workflows." />
            <Card icon={<Lightbulb size={21} />} title="Technology" text="Modern tools that make learning easier to manage." />
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 py-12">
        <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-7 md:p-10">
          <div className="flex gap-4">
            <HeartHandshake className="text-indigo-600 shrink-0" size={28} />
            <div>
              <h2 className="text-2xl font-black">Our commitment</h2>
              <p className="text-slate-700 mt-3 leading-relaxed">
                We aim to keep the platform student-focused, transparent and
                responsible, with appropriate safeguards for academic records,
                payments, tutor approvals and account permissions.
              </p>
              <div className="grid sm:grid-cols-2 gap-3 mt-6">
                <Commitment text="Student-first learning experience" />
                <Commitment text="Transparent tutor processes" />
                <Commitment text="Secure account and payment workflows" />
                <Commitment text="Continuous platform improvement" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-950 text-white">
        <div className="max-w-6xl mx-auto px-5 py-12 text-center">
          <Award className="mx-auto text-indigo-300" size={30} />
          <h2 className="text-2xl md:text-3xl font-black mt-4">VATTAMS Academy</h2>
          <p className="text-slate-300 mt-2">Learn. Grow. Achieve.</p>
        </div>
      </section>
    </main>
  );
}

function Card({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border bg-slate-50 p-5">
      <div className="text-indigo-600">{icon}</div>
      <h3 className="font-black mt-4">{title}</h3>
      <p className="text-sm text-slate-500 mt-1 leading-relaxed">{text}</p>
    </div>
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
