import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Sun, Briefcase, User, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, parseISO, isWithinInterval } from "date-fns";
import LeaveRequestForm from "@/components/people/LeaveRequestForm";

export default function CalendarPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const { data: holidays = [] } = useQuery({
    queryKey: ["holidays"],
    queryFn: () => base44.entities.Holiday.list(),
  });

  const { data: leaveRequests = [] } = useQuery({
    queryKey: ["leaveRequests"],
    queryFn: () => base44.entities.LeaveRequest.list("-created_at"),
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => base44.entities.User.list(),
  });

  const handleCreateLeave = async (data) => {
    await base44.entities.LeaveRequest.create({
      ...data,
      requester: currentUser?.email,
      requester_name: currentUser?.full_name,
    });
    queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
    setShowLeaveForm(false);
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad days to start on Sunday
  const firstDayOfWeek = monthStart.getDay();
  const paddingDays = Array(firstDayOfWeek).fill(null);

  const getEventsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const events = [];

    // Check holidays
    holidays.forEach(holiday => {
      if (holiday.date === dateStr) {
        events.push({
          type: 'holiday',
          subtype: holiday.type,
          name: holiday.name,
          data: holiday
        });
      }
    });

    // Check leave requests
    leaveRequests.forEach(leave => {
      if (leave.status === 'approved') {
        const startDate = parseISO(leave.start_date);
        const endDate = parseISO(leave.end_date);
        if (isWithinInterval(date, { start: startDate, end: endDate })) {
          events.push({
            type: 'leave',
            subtype: leave.status,
            name: leave.requester_name,
            data: leave
          });
        }
      }
    });

    return events;
  };

  const pendingLeaveRequests = leaveRequests.filter(r => r.status === 'pending');
  const upcomingLeave = leaveRequests.filter(r => {
    if (r.status !== 'approved') return false;
    const startDate = parseISO(r.start_date);
    return startDate >= new Date();
  }).slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Team Calendar
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">
              View holidays and team availability
            </p>
          </div>
          <Button onClick={() => setShowLeaveForm(true)} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/30">
            <Plus className="w-4 h-4 mr-2" />
            Request Time Off
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Calendar */}
          <Card className="lg:col-span-2 backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 border-white/20 dark:border-zinc-800/50 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold">
                  {format(currentDate, 'MMMM yyyy')}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                    className="rounded-xl"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentDate(new Date())}
                    className="rounded-xl"
                  >
                    <CalendarIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                    className="rounded-xl"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Day headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-semibold text-zinc-600 dark:text-zinc-400 py-2">
                    {day}
                  </div>
                ))}

                {/* Padding days */}
                {paddingDays.map((_, index) => (
                  <div key={`pad-${index}`} className="aspect-square" />
                ))}

                {/* Calendar days */}
                {daysInMonth.map(day => {
                  const events = getEventsForDate(day);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isCurrentDay = isToday(day);

                  return (
                    <button
                      key={day.toString()}
                      onClick={() => setSelectedDate(day)}
                      className={`aspect-square p-1 rounded-2xl transition-all duration-200 ${
                        isCurrentDay
                          ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                          : isSelected
                          ? 'bg-purple-100 dark:bg-purple-900/30 ring-2 ring-purple-500'
                          : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <div className="text-sm font-medium mb-1">
                        {format(day, 'd')}
                      </div>
                      <div className="space-y-0.5">
                        {events.slice(0, 2).map((event, idx) => (
                          <div
                            key={idx}
                            className={`h-1 rounded-full ${
                              event.type === 'holiday'
                                ? event.subtype === 'public'
                                  ? 'bg-blue-500'
                                  : 'bg-purple-500'
                                : 'bg-green-500'
                            }`}
                          />
                        ))}
                        {events.length > 2 && (
                          <div className="text-xs text-zinc-500">+{events.length - 2}</div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-6 flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">Public Holiday</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">Company Event</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">Team Member Away</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Date Events */}
            {selectedDate && (
              <Card className="backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 border-white/20 dark:border-zinc-800/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {format(selectedDate, 'MMM d, yyyy')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getEventsForDate(selectedDate).length === 0 ? (
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">No events</p>
                    ) : (
                      getEventsForDate(selectedDate).map((event, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                          <div className="flex items-start gap-2">
                            {event.type === 'holiday' ? (
                              event.subtype === 'public' ? (
                                <Sun className="w-4 h-4 text-blue-500 mt-0.5" />
                              ) : (
                                <Briefcase className="w-4 h-4 text-purple-500 mt-0.5" />
                              )
                            ) : (
                              <User className="w-4 h-4 text-green-500 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-sm">{event.name}</p>
                              {event.type === 'leave' && (
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                  {event.data.reason || 'Time off'}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Upcoming Leave */}
            <Card className="backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 border-white/20 dark:border-zinc-800/50 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg">Upcoming Time Off</CardTitle>
                <CardDescription>Next 5 approved leaves</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingLeave.length === 0 ? (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">No upcoming leaves</p>
                  ) : (
                    upcomingLeave.map(leave => (
                      <div key={leave.id} className="p-3 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800/50">
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                              {leave.requester_name}
                            </p>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400">
                              {format(parseISO(leave.start_date), 'MMM d')} - {format(parseISO(leave.end_date), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Pending Requests (for user's own) */}
            {pendingLeaveRequests.filter(r => r.requester === currentUser?.email).length > 0 && (
              <Card className="backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 border-white/20 dark:border-zinc-800/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Your Pending Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingLeaveRequests
                      .filter(r => r.requester === currentUser?.email)
                      .map(leave => (
                        <div key={leave.id} className="p-3 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800/50">
                          <div className="flex items-start gap-2">
                            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                            <div className="flex-1">
                              <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                                Pending Approval
                              </p>
                              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                {format(parseISO(leave.start_date), 'MMM d')} - {format(parseISO(leave.end_date), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <LeaveRequestForm
        open={showLeaveForm}
        onClose={() => setShowLeaveForm(false)}
        onSubmit={handleCreateLeave}
      />
    </div>
  );
}
