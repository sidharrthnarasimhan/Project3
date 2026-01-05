import CategoryCard from "./CategoryCard";

export default function CategoryView({ decisions, tasks }) {
  // Group decisions and tasks by category
  const categories = ['engineering', 'product', 'hiring', 'business'];

  const categoryData = categories.map(category => {
    const categoryDecisions = decisions.filter(d => d.category === category);
    const categoryTasks = tasks.filter(t => t.category === category);

    return {
      category,
      decisions: categoryDecisions,
      tasks: categoryTasks,
      hasData: categoryDecisions.length > 0 || categoryTasks.length > 0,
    };
  }).filter(data => data.hasData);

  if (categoryData.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500 dark:text-zinc-400">
          No categorized decisions or tasks yet
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categoryData.map(({ category, decisions: catDecisions, tasks: catTasks }) => (
        <CategoryCard
          key={category}
          category={category}
          decisions={catDecisions}
          tasks={catTasks}
        />
      ))}
    </div>
  );
}
