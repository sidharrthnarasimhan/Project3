import { getData, setData, generateId } from './mockData';

// Generic entity class that provides CRUD operations
class Entity {
  constructor(entityName) {
    this.entityName = entityName;
  }

  list(sortBy = '-created_date') {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = getData();
        let items = [...(data[this.entityName] || [])];

        // Handle sorting
        if (sortBy) {
          const isDescending = sortBy.startsWith('-');
          const field = isDescending ? sortBy.slice(1) : sortBy;

          items.sort((a, b) => {
            const aVal = a[field];
            const bVal = b[field];

            if (aVal < bVal) return isDescending ? 1 : -1;
            if (aVal > bVal) return isDescending ? -1 : 1;
            return 0;
          });
        }

        resolve(items);
      }, 100); // Simulate network delay
    });
  }

  get(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const data = getData();
        const item = data[this.entityName].find(i => i.id === id);

        if (item) {
          resolve(item);
        } else {
          reject(new Error(`${this.entityName} with id ${id} not found`));
        }
      }, 100);
    });
  }

  create(itemData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = getData();
        const newItem = {
          id: generateId(this.entityName.slice(0, -1)),
          created_date: new Date().toISOString(),
          ...itemData,
        };

        data[this.entityName].push(newItem);
        setData(data);
        resolve(newItem);
      }, 100);
    });
  }

  update(id, updates) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const data = getData();
        const index = data[this.entityName].findIndex(i => i.id === id);

        if (index === -1) {
          reject(new Error(`${this.entityName} with id ${id} not found`));
          return;
        }

        data[this.entityName][index] = {
          ...data[this.entityName][index],
          ...updates,
        };

        setData(data);
        resolve(data[this.entityName][index]);
      }, 100);
    });
  }

  delete(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const data = getData();
        const index = data[this.entityName].findIndex(i => i.id === id);

        if (index === -1) {
          reject(new Error(`${this.entityName} with id ${id} not found`));
          return;
        }

        data[this.entityName].splice(index, 1);
        setData(data);
        resolve({ success: true });
      }, 100);
    });
  }
}

// Create entity instances
export const Task = new Entity('tasks');
export const Decision = new Entity('decisions');
export const Announcement = new Entity('announcements');
export const LeaveRequest = new Entity('leaveRequests');
export const Comment = new Entity('comments');
export const UserEntity = new Entity('users');
export const Holiday = new Entity('holidays');
export const TimeEntry = new Entity('timeEntries');
export const BillingTool = new Entity('billingTools');
export const Milestone = new Entity('milestones');
export const Space = new Entity('spaces');
