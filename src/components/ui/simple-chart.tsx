// Simple chart components without the complex ChartTooltip that's causing TypeScript issues
import { cn } from "@/lib/utils";

interface SimpleChartContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const SimpleChartContainer = ({ children, className }: SimpleChartContainerProps) => {
  return (
    <div className={cn("w-full h-full", className)}>
      {children}
    </div>
  );
};