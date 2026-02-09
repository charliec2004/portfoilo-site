export default function MainGrid({ children }) {
  return (
    <main className="flex flex-1 flex-row w-full p-0 max-w-[2000px] gap-4 overflow-visible min-h-0 max-lg:flex-col">
      {children}
    </main>
  );
}
