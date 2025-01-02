import { ApexOptions } from 'apexcharts';
import React, { useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import DropdownDefault from '../Dropdowns/DropdownDefault';

interface ChartSixState {
  series: {
    name: string;
    data: number[];
  }[];
}

const ChartSix: React.FC = () => {
  const [state, setState] = useState<ChartSixState>({
    series: [
      {
        name: 'Product One',
        data: [168, 285, 131, 248, 187, 295, 191, 269, 201, 185, 252, 151],
      },

      {
        name: 'Product Two',
        data: [268, 185, 251, 198, 287, 205, 281, 199, 259, 185, 150, 111],
      },
    ],
  });

  // Update the state
  const updateState = () => {
    setState((prevState) => ({
      ...prevState,
      // Update the desired properties
    }));
  };
  updateState();

  const options: ApexOptions = {
    legend: {
      show: false,
      position: 'top',
      horizontalAlign: 'left',
    },
    colors: ['#13C296', '#3C50E0'],
    chart: {
      fontFamily: 'Satoshi, sans-serif',
      height: 200,
      type: 'area',
      toolbar: {
        show: false,
      },
    },
    fill: {
      gradient: {
        // enabled: true,
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          chart: {
            height: 300,
          },
        },
      },
      {
        breakpoint: 1366,
        options: {
          chart: {
            height: 320,
          },
        },
      },
    ],
    stroke: {
      width: [2, 2],
      curve: 'smooth',
    },

    markers: {
      size: 0,
    },
    // labels: {
    //   show: false,
    //   position: 'top',
    // },
    grid: {
      strokeDashArray: 7,
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      type: 'category',
      categories: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        style: {
          fontSize: '0px',
        },
      },
    },
  };

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8">
      <div className="mb-6 flex items-start justify-between">
        <div className="flex w-full flex-wrap gap-3 sm:gap-5">
          <div className="flex min-w-47.5">
            <span className="mt-1 mr-2 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-primary">
              <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-primary"></span>
            </span>
            <div className="w-full">
              <p
                style={{ color: '#3C50E0' }}
                className="font-semibold text-primary"
              >
                Job Applications
              </p>
              <p className="text-sm font-medium">12.01.2024 - 12.01.2025</p>
            </div>
          </div>
          <div className="flex min-w-47.5">
            <span className="mt-1 mr-2 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-secondary">
              <span
                style={{ backgroundColor: '#13C296' }}
                className="block h-2.5 w-full max-w-2.5 rounded-full"
              ></span>
            </span>
            <div className="w-full">
              <p
                style={{ color: '#13C296' }}
                className="font-semibold text-secondary"
              >
                Interviewing
              </p>
              <p className="text-sm font-medium">12.01.2024 - 12.01.2025</p>
            </div>
          </div>
        </div>
        <DropdownDefault />
      </div>
      <div>
        <div id="chartSix" className="-ml-5">
          <ReactApexChart
            options={options}
            series={state.series}
            type="area"
            height={200}
          />
        </div>
      </div>
    </div>
  );
};

export default ChartSix;
