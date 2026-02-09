export default function RightColumn({ children }) {
  return (
    <aside className="flex flex-col gap-4 min-h-0 min-w-0 flex-[1_1_0] justify-center max-h-[1000px] max-lg:max-h-none max-lg:flex-auto max-lg:w-full max-lg:justify-start max-lg:min-h-[50vh]">
      {children}
    </aside>
  );
}
