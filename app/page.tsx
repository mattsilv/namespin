import PrizeWheel from "./components/PrizeWheel";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-6">
      <div className="w-full max-w-5xl">
        <h1 className="text-3xl font-bold text-center mb-2">Name Spin Wheel</h1>
        <p className="text-gray-600 text-center mb-8">
          Randomly select a name from the list with a 10-second spinning wheel
          animation.
        </p>

        <PrizeWheel />

        <div className="mt-12 text-sm text-gray-500 max-w-2xl mx-auto">
          <h2 className="font-semibold text-lg mb-2">How to use:</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Add names to the list using the form below the wheel</li>
            <li>Click "Spin the Wheel!" to start the animation</li>
            <li>The wheel will spin for exactly 10 seconds</li>
            <li>The winner will be announced when the wheel stops</li>
          </ol>
        </div>
      </div>
    </main>
  );
}
