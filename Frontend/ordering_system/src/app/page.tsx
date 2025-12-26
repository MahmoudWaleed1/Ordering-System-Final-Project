import { Book, Search, BookOpen, Library, ArrowRight } from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: Book,
      title: "Vast Collection",
      description: "Access thousands of books across all genres"
    },
    {
      icon: Search,
      title: "Easy Search",
      description: "Find your next read in seconds"
    },
    {
      icon: BookOpen,
      title: "Read Anywhere",
      description: "Available on all your devices"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1020] via-[#1a1a2e] to-black text-white">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-700 rounded-2xl mb-8 shadow-[0_10px_30px_rgba(128,0,255,0.5)]">
            <Library className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Welcome to Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
              Online Library
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Discover, read, and explore thousands of books at your fingertips. 
            Your next great story awaits.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
              Browse Books
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="px-8 py-4 bg-[#0b1020] hover:bg-[#1a1a2e] text-purple-400 font-semibold rounded-xl border-2 border-purple-600 transition-all shadow-md hover:shadow-lg">
              Learn More
            </button>
          </div>
        </div>
      </section>

   
    </div>
  );
}
