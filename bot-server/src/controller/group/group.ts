import { GroupKelompok } from "../../../type";

// todo: even out gender for each group
export const createGroups = (
  students: string[],
  numGroups: number
): GroupKelompok[] => {
  const shuffleArray = (array: string[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  shuffleArray(students);

  const groups: GroupKelompok[] = [];
  const groupSize = Math.floor(students.length / numGroups);
  const remainder = students.length % numGroups;

  let studentIndex = 0;

  for (let i = 0; i < numGroups; i++) {
    const currentGroupSize = groupSize + (i < remainder ? 1 : 0);
    groups.push({
      participants: students.slice(
        studentIndex,
        studentIndex + currentGroupSize
      ),
      numberOfParticipants: currentGroupSize,
    });
    studentIndex += currentGroupSize;
  }

  return groups;
};
