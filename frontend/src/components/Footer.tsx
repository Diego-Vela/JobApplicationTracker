export default function Footer() {
  return (
    <footer className="mt-10 border-t bg-gray-50">
      <div className="mx-auto w-full max-w-screen-lg min-w-[320px] px-4 py-6 text-center text-gray-600 text-[clamp(0.85rem,1.4vw,0.95rem)]">
        {/* Product identity */}
        <p>
          © {new Date().getFullYear()} <span className="font-semibold">Jobblet</span>
        </p>

        {/* Secondary links */}
        <div className="mt-2 flex flex-wrap justify-center gap-4">
          <a href="/privacy" className="hover:underline">
            Privacy Policy
          </a>
          <a href="/terms" className="hover:underline">
            Terms of Service
          </a>
          <a href="/about" className="hover:underline">
            Contact
          </a>
        </div>

        {/* Maker credit */}
        <div className="mt-4 text-gray-500">
          Built with ❤️ by <span className="font-semibold">DiVe</span>
        </div>
      </div>
    </footer>
  );
}
