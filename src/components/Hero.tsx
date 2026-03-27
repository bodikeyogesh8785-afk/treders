import Link from 'next/link';

export function Hero() {
  return (
    <div className="relative bg-green-900 text-white overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-40">
        <img
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
          alt="Professional Farming Banner"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 mt-12 animate-fade-in-up">
          Empowering Farmers with Quality Agriculture Products
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-green-100 mb-8 mt-4 animate-fade-in-up delay-100">
          From high-yield seeds to advanced fertilizers and safe pesticides, we provide everything you need for a successful harvest.
        </p>
        <div className="flex justify-center gap-4 mt-8 animate-fade-in-up delay-200">
          <Link href="#products" className="btn-secondary text-lg px-8 py-3 rounded-full">
            Shop Now
          </Link>
          <a href="https://wa.me/919640799154?text=Hello,%20I%20want%20to%20know%20more%20about%20your%20products." className="btn-whatsapp text-lg px-8 py-3 rounded-full flex gap-2" target="_blank" rel="noreferrer">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
            Contact via WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
