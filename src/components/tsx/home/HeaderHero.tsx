import { Button } from '@/components/tsx/ui/button'

const Landing = () => (
  <>
    {/* Hero Section */}
    <section className="pt-32 pb-20 px-6">
      <div className="container mx-auto text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 animate-fade-in">
            AI-Powered Workflow Assistant
          </h1>
          <p className="text-xl text-white/80 mb-8 animate-fade-in">
            Streamline your production, amplify your creativity.
          </p>
          <div className="flex flex-wrap justify-center gap-4 animate-fade-in">
            <button className="btn-primary">Get Started</button>
            <button className="btn-secondary">Download</button>
          </div>
        </div>
      </div>
    </section>
  </>
)

export default Landing
