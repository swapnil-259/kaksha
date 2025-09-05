import {TimeTableDetails} from '@kaksha/types/timetable';
import dayjs from 'dayjs';

const capatalize = (s?: string, all?: boolean) => {
  const words = s?.split(' ') ?? [];
  words.forEach((word, i) => {
    if ((all ?? true) || i == 0) {
      words.splice(
        i,
        1,
        `${word.at(0)?.toUpperCase()}${word.slice(1).toLowerCase()}`,
      );
    } else {
      words.splice(i, 1, word.toLowerCase());
    }
  });
  return words.join(' ');
};

const limitText = (text: string, limit?: number) => {
  return text.length > (limit ?? 30)
    ? text.slice(0, (limit ?? 30) - 3) + '...'
    : text;
};

const parseTimeTable = (timetable?: TimeTableDetails[][]) => {
  const weekDays = [...Array(7)]
    .map((_, i) => ({
      [i]: {
        day: dayjs().day(i).format('ddd'),
        timetable: [] as TimeTableDetails[],
      },
    }))
    .reduce((prev, val) => ({...prev, ...val}), {});
  timetable?.flat().forEach(each => {
    weekDays[(each.day + 1) % 7].timetable.push(each);
  });

  return weekDays;
};

const parseSessionName = (session?: string) => {
  const start_year = `20${session?.slice(0, 2)}`;
  const end_year = `20${session?.slice(2, 4)}`;
  const sem_type = session?.at(4) === 'o' ? 'ODD' : 'EVEN';
  return `${start_year}-${end_year}(${sem_type})`;
};

export {capatalize, limitText, parseSessionName, parseTimeTable};
