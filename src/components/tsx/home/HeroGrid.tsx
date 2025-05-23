import {
  Rocket,
  Zap,
  Box,
  Trophy,
  Users,
  ThumbsUp,
  Monitor,
  ShoppingBag,
} from 'lucide-react'

const FeatureCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: any
  title: string
  description: string
}) => (
  <div className="glass-card p-6 transition-all duration-300 hover:scale-105">
    <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
      <Icon className="h-6 w-6 text-primary" />
    </div>
    <h3 className="text-lg font-semibold mb-2 text-foreground">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
)

const HeroGrid = () => (
  <>
    {/* Features Grid */}
    <section className="bg-secondary/30 gradient-to-b bg-secondary/30">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-foreground">What we offer</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={Zap}
            title="Strong empathy"
            description="Understand and connect with your audience effectively"
          />
          <FeatureCard
            icon={Box}
            title="Effortless updates"
            description="Keep your content fresh with seamless updates"
          />
          <FeatureCard
            icon={Trophy}
            title="Conquer the best"
            description="Stay ahead of the competition with cutting-edge tools"
          />
          <FeatureCard
            icon={Users}
            title="Designing for people"
            description="Create experiences that users love"
          />
          <FeatureCard
            icon={ThumbsUp}
            title="Simple and affordable"
            description="Get premium features at accessible prices"
          />
          <FeatureCard
            icon={Monitor}
            title="Get freelance work"
            description="Connect with potential clients easily"
          />
          <FeatureCard
            icon={ShoppingBag}
            title="Sell your goods"
            description="Set up your online store effortlessly"
          />
          <FeatureCard
            icon={Rocket}
            title="Launch faster"
            description="Accelerate your project deployment"
          />
        </div>
      </div>
    </section>
  </>
)

export default HeroGrid
