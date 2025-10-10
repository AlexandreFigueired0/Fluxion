import Button from '../ui/Button';

const CTA = () => {
  return (
    <div className="max-w-4xl mx-auto px-8 py-32 text-center border-t border-zinc-800">
      <h2 className="text-5xl font-black mb-6">
        Stop debugging.<br />
        Start deploying.
      </h2>
      <p className="text-xl text-zinc-400 mb-12">
        50 free credits. No credit card. Get your API key in 30 seconds.
      </p>
      <Button className="text-lg px-12 py-5">
        Get Started Free →
      </Button>
    </div>
  );
}

export default CTA;
