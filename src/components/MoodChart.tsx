import React from 'react';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  ChartOptions
} from 'chart.js';
import { format, subDays, isSameDay } from 'date-fns'; // Added isSameDay
import { JournalEntry } from '../contexts/JournalContext';
import { Timestamp } from 'firebase/firestore'; // Import Timestamp

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend
);

interface MoodChartProps {
  entries: JournalEntry[];
}

const MoodChart: React.FC<MoodChartProps> = ({ entries }) => {
  // Generate Date objects for the last 7 days
  const targetDates = Array.from({ length: 7 }, (_, i) => subDays(new Date(), i)).reverse();

  // Generate labels for the chart axis
  const chartLabels = targetDates.map(date => format(date, 'MMM d'));

  // Map entries to their corresponding day, converting Timestamp
  const moodData = targetDates.map(targetDate => {
    const entry = entries.find(e => {
      // Convert Timestamp to Date for comparison
      const entryDate = e.date instanceof Timestamp ? e.date.toDate() : e.date;
      return isSameDay(entryDate, targetDate);
    });
    // Use entry's mood or fallback to random for demo
    return entry ? entry.mood : null; // Use null for missing data points initially
    // Or use fallback: return entry ? entry.mood : Math.floor(Math.random() * 3) + 2;
  });

  // Optional: Handle nulls if you want to connect lines over missing days
  // This example keeps nulls, which might break the line.
  // You could implement logic here to fill nulls (e.g., with previous value or average).
  
  const options: ChartOptions<'line'> = {
    responsive: true,
    scales: {
      y: {
        min: 1,
        max: 5,
        ticks: {
          stepSize: 1,
          callback: function(value) {
            const labels = ['Very Low', 'Low', 'Neutral', 'Good', 'Great'];
            return labels[Number(value) - 1];
          }
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
        }
      },
      x: {
        grid: {
          display: false,
        }
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const labels = ['Very Low', 'Low', 'Neutral', 'Good', 'Great'];
            const value = context.parsed.y;
            return `Mood: ${labels[value - 1]}`;
          }
        }
      }
    },
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 6,
        hoverRadius: 8,
      }
    }
  };

  const data = {
    labels: chartLabels, // Use generated labels
    datasets: [
      {
        label: 'Mood', // Keep label
        data: moodData, // Use processed moodData
        spanGaps: true, // Connect line across null data points
        borderColor: '#FDE047', // Consider using theme colors from Tailwind config
        backgroundColor: '#FDE047', // Point background color
        fill: false, // Don't fill under the line
        pointBackgroundColor: '#FDE047',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        // Removed duplicate properties
      }
    ]
  };
  
  return <Line options={options} data={data} />;
};

export default MoodChart;
