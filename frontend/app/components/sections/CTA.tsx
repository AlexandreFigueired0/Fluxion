import Button from '../ui/Button';

const CTA = () => {
  return (
    <div className="max-w-4xl mx-auto px-8 py-32 text-center border-t border-zinc-800">
      <h2 className="text-5xl font-black mb-6">
        Start deploying.
      </h2>
      <p className="text-xl text-zinc-400 mb-12">
        5 free credits.
      </p>
      <Button className="text-lg px-12 py-5 cursor-pointer">
        Get Started Free →
      </Button>
    </div>
  );
}

export default CTA;
