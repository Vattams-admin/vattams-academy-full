export type AcademyCourse = {
  id: string;
  title: string;
  category: string;
  level: string;
  description: string;
  mode: 'online';
  featured?: boolean;
  active: boolean;
  tags: string[];
};

export function filterCourses(
  courses: AcademyCourse[],
  filters: {
    query?: string;
    category?: string;
    level?: string;
  },
) {
  const query = filters.query?.trim().toLowerCase() || '';
  const category = filters.category || 'All';
  const level = filters.level || 'All';

  return courses.filter((course) => {
    const searchable = [
      course.title,
      course.category,
      course.level,
      course.description,
      ...course.tags,
    ]
      .join(' ')
      .toLowerCase();

    return (
      course.active &&
      (!query || searchable.includes(query)) &&
      (category === 'All' || course.category === category) &&
      (level === 'All' || course.level === level)
    );
  });
}

export function getCourseCategories(courses: AcademyCourse[]) {
  return ['All', ...Array.from(new Set(courses.map((course) => course.category)))];
}

export function getCourseLevels(courses: AcademyCourse[]) {
  return ['All', ...Array.from(new Set(courses.map((course) => course.level)))];
}
