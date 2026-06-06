"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, Check, ChevronLeft, ChevronRight, Feather, Plus, SlidersHorizontal, Sun, TimerReset, X, Edit2, Leaf } from "lucide-react";
import { DayRecord, Store, Task } from "@/lib/types";
import { addDays, dateKey, dayName, formatMonth, fromDateKey, monthName, seedStore, startOfWeek } from "@/lib/dates";
import { loadLocalStore, saveLocalStore } from "@/lib/storage";
import { fetchDays, saveDay } from "@/lib/api";

const navItems = [
  { label: "Today", icon: Sun },
  { label: "Timeline", icon: TimerReset },
  { label: "Reflections", icon: Leaf }
];

export default function Home() {
  const [store, setStore] = useState<Store>(() => seedStore());
  const [currentKey, setCurrentKey] = useState(() => dateKey(new Date()));
  const [currentTime, setCurrentTime] = useState<string>("");
  const [greeting, setGreeting] = useState<string>("");
  const currentDay = store.days[currentKey] ?? emptyDay();
  const currentDate = fromDateKey(currentKey);
  const week = useMemo(() => {
    const start = startOfWeek(currentDate);
    return Array.from({ length: 7 }, (_, index) => addDays(start, index));
  }, [currentKey]);

  useEffect(() => {
    const localStore = loadLocalStore();
    if (localStore) {
      setStore(localStore);
    }

    fetchDays()
      .then((remoteStore) => {
        if (remoteStore) {
          setStore(remoteStore);
          saveLocalStore(remoteStore);
        }
      })
      .catch(() => {
        // Local storage remains the fallback until the Rust API is reachable.
      });
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));

      const hour = now.getHours();
      if (hour >= 5 && hour < 12) {
        setGreeting("Good Morning");
      } else if (hour >= 12 && hour < 17) {
        setGreeting("Good Afternoon");
      } else if (hour >= 17 && hour < 21) {
        setGreeting("Good Evening");
      } else {
        setGreeting("Good Night");
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  function mutateDay(mutator: (day: DayRecord) => DayRecord) {
    setStore((previous) => {
      const nextDay = mutator(previous.days[currentKey] ?? emptyDay());
      const next = {
        ...previous,
        days: {
          ...previous.days,
          [currentKey]: nextDay
        }
      };
      saveLocalStore(next);
      void saveDay(currentKey, nextDay);
      return next;
    });
  }

  function addTask(title: string) {
    if (!title.trim()) return;
    mutateDay((day) => ({
      ...day,
      tasks: [...day.tasks, { id: crypto.randomUUID(), title: title.trim(), done: false }]
    }));
  }

  function updateTask(id: string, patch: Partial<Task>) {
    mutateDay((day) => ({
      ...day,
      tasks: day.tasks.map((task) => (task.id === id ? { ...task, ...patch } : task))
    }));
  }

  function deleteTask(id: string) {
    mutateDay((day) => ({ ...day, tasks: day.tasks.filter((task) => task.id !== id) }));
  }

  function reorderTasks(reorderedTasks: Task[]) {
    mutateDay((day) => ({ ...day, tasks: reorderedTasks }));
  }

  const completed = currentDay.tasks.filter((task) => task.done).length;

  return (
    <div className="appShell">
      {/* LEFT SIDEBAR */}
      <aside className="sidebarLeft">
        <div className="brand">
          <span className="brandIcon"><BookOpen size={18} /></span>
          <span>Chronicle</span>
        </div>

        <nav className="nav">
          {navItems.map((item, index) => (
            <a
              href={item.label === "Today" ? "/" : `/${item.label.toLowerCase()}`}
              className={index === 0 ? "navItem active" : "navItem"}
              key={item.label}
              onClick={(e) => {
                if (item.label === "Today") {
                  e.preventDefault();
                  setCurrentKey(dateKey(new Date()));
                }
              }}
            >
              <item.icon size={17} />
              {item.label}
            </a>
          ))}
        </nav>

        {/* Date Context Block */}
        <div className="dateContext">
          <div className="dateBlock">
            <p className="dateLabel">{monthName(currentDate)}</p>
            <p className="dateValue">{currentDate.getDate()}</p>
            <p className="timeValue">{currentTime}</p>
            <p className="greetingValue">{greeting}</p>
          </div>
        </div>

        {/* Compact Weekly Calendar */}
        <div className="miniCalendar">
          <div className="miniCalHeader">
            <button className="miniBtn" onClick={() => setCurrentKey(dateKey(addDays(currentDate, -7)))}>
              <ChevronLeft size={14} />
            </button>
            <button className="todayBtn" onClick={() => setCurrentKey(dateKey(new Date()))}>Today</button>
            <button className="miniBtn" onClick={() => setCurrentKey(dateKey(addDays(currentDate, 7)))}>
              <ChevronRight size={14} />
            </button>
          </div>
          <div className="miniWeekStrip">
            {week.map((day) => {
              const key = dateKey(day);
              const selected = key === currentKey;
              const record = store.days[key];
              const fullDate = day.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
              return (
                <button
                  className={selected ? "miniDayPill selected" : "miniDayPill"}
                  key={key}
                  onClick={() => setCurrentKey(key)}
                  title={fullDate}
                  aria-label={fullDate}
                  aria-current={selected ? "date" : undefined}
                >
                  <span className="miniDayName">{dayName(day).slice(0, 1)}</span>
                  <span className="miniDayNum">{day.getDate()}</span>
                  {(record?.mood || record?.journal) && <i className="miniDot" />}
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="mainContent">
        <div className="tasksSection">
          <div className="tasksHeader">
            <div>
              <h2>Tasks</h2>
              <p className="tasksDate">{monthName(currentDate)} {currentDate.getDate()}</p>
            </div>
            <div className="tasksStats">{completed} / {currentDay.tasks.length}</div>
          </div>
          <div className="tasksProgress"><span style={{ width: `${currentDay.tasks.length ? (completed / currentDay.tasks.length) * 100 : 0}%` }} /></div>
          <TaskList tasks={currentDay.tasks} onUpdate={updateTask} onDelete={deleteTask} onAdd={addTask} onReorder={reorderTasks} />
        </div>
      </main>

      {/* RIGHT SIDEBAR */}
      <aside className="sidebarRight">
        <section className="card journal">
          <Label icon={<Feather size={15} />} color="sky">Journal</Label>
          <textarea
            value={currentDay.journal}
            onChange={(event) => mutateDay((day) => ({ ...day, journal: event.target.value }))}
            placeholder="Today I'm thinking about..."
          />
        </section>

        <section className="card moodCard">
          <Label icon={<SlidersHorizontal size={15} />}>How today feels</Label>
          <MoodScale label="Mood" value={currentDay.mood} onChange={(mood) => mutateDay((day) => ({ ...day, mood }))} />
          <MoodScale label="Energy" value={currentDay.energy} onChange={(energy) => mutateDay((day) => ({ ...day, energy }))} />
        </section>
      </aside>
    </div>
  );
}

function emptyDay(): DayRecord {
  return { journal: "", reflection: "", mood: 0, energy: 0, tasks: [] };
}

function Label({ children, icon, color = "peach" }: { children: React.ReactNode; icon: React.ReactNode; color?: "peach" | "sky" | "mint" }) {
  return (
    <div className="label">
      <span className={color}>{icon}</span>
      <b>{children}</b>
    </div>
  );
}

function MoodScale({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <div className="scale">
      <strong>{label}</strong>
      <div>
        <span className="label">Low</span>
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            className={value >= score ? "filled" : ""}
            key={score}
            onClick={() => onChange(score)}
            aria-label={`Set ${label} to ${score} out of 5`}
            aria-pressed={value >= score}
          />
        ))}
        <span className="label">High</span>
      </div>
    </div>
  );
}

function TaskList({
  tasks,
  onUpdate,
  onDelete,
  onAdd,
  onReorder
}: {
  tasks: Task[];
  onUpdate: (id: string, patch: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onAdd: (title: string) => void;
  onReorder: (tasks: Task[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [reorderedTasks, setReorderedTasks] = useState(tasks);

  useEffect(() => {
    setReorderedTasks(tasks);
  }, [tasks]);

  const startEdit = (id: string, text: string) => {
    setEditingId(id);
    setEditingText(text);
  };

  const saveEdit = (id: string) => {
    if (editingText.trim()) {
      onUpdate(id, { title: editingText });
    }
    setEditingId(null);
  };

  const handleDragStart = (id: string, e: React.DragEvent) => {
    e.dataTransfer!.effectAllowed = "move";
    setDraggedId(id);
  };

  const handleDragOver = (id: string, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer!.dropEffect = "move";
    setDragOverId(id);
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (targetId: string, e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const draggedIndex = reorderedTasks.findIndex(t => t.id === draggedId);
    const targetIndex = reorderedTasks.findIndex(t => t.id === targetId);

    const newTasks = [...reorderedTasks];
    const [removed] = newTasks.splice(draggedIndex, 1);
    newTasks.splice(targetIndex, 0, removed);

    setReorderedTasks(newTasks);
    onReorder(newTasks);

    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  return (
    <div className="tasks">
      {reorderedTasks.map((task) => (
        <div
          key={task.id}
          draggable
          onDragStart={(e) => handleDragStart(task.id, e)}
          onDragOver={(e) => handleDragOver(task.id, e)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(task.id, e)}
          onDragEnd={handleDragEnd}
          className={`task ${draggedId === task.id ? "dragging" : ""} ${dragOverId === task.id ? "dragOver" : ""}`}
        >
          <span className="dragHandle" title="Drag to reorder">⠿</span>
          <button
            className={task.done ? "check done" : "check"}
            onClick={() => onUpdate(task.id, { done: !task.done })}
            aria-label={`Mark task as ${task.done ? "incomplete" : "complete"}`}
          >
            {task.done ? <Check size={14} /> : null}
          </button>
          {editingId === task.id ? (
            <textarea
              autoFocus
              value={editingText}
              onChange={(event) => setEditingText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  saveEdit(task.id);
                }
              }}
              aria-label="Edit task"
              style={{ minHeight: "2.5em", resize: "none", overflow: "hidden" }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 400) + "px";
              }}
              ref={(el) => {
                if (el && editingId === task.id) {
                  setTimeout(() => {
                    el.style.height = "auto";
                    el.style.height = Math.min(el.scrollHeight, 400) + "px";
                  }, 0);
                }
              }}
            />
          ) : (
            <span
              onClick={() => onUpdate(task.id, { done: !task.done })}
              role="button"
              tabIndex={0}
              aria-label={`${task.title}${task.done ? " (completed)" : ""}`}
              onKeyPress={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onUpdate(task.id, { done: !task.done });
                }
              }}
              style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
            >
              {task.title}
            </span>
          )}
          <button
            className="editTask"
            onClick={() => startEdit(task.id, task.title)}
            aria-label={`Edit task: ${task.title}`}
            title="Edit task"
          >
            <Edit2 size={16} />
          </button>
          <button
            className="delete"
            onClick={() => onDelete(task.id)}
            aria-label={`Delete task: ${task.title}`}
            title="Delete task"
          >
            ×
          </button>
        </div>
      ))}
      <form
        className="addTask"
        onSubmit={(event) => {
          event.preventDefault();
          onAdd(draft);
          setDraft("");
        }}
      >
        <Plus size={16} />
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Add a task..."
          aria-label="Add a new task"
          style={{ minHeight: "2.5em", resize: "none", overflow: "hidden" }}
          onInput={(e) => {
            const el = e.currentTarget;
            el.style.height = "auto";
            el.style.height = Math.min(el.scrollHeight, 400) + "px";
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              const form = event.currentTarget.form;
              if (form) form.dispatchEvent(new Event("submit", { bubbles: true }));
            }
          }}
        />
      </form>
    </div>
  );
}
