"use client"

import * as React from "react"
import { format, parseISO, isValid, addMonths, subMonths, setYear, setMonth, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, setHours, setMinutes, parse } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon, X, ChevronLeft, ChevronRight, Clock, Check, Zap } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateTimePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
}

type ViewMode = "days" | "months" | "years" | "time"

export function DateTimePicker({ date, setDate }: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [viewDate, setViewDate] = React.useState(new Date())
  const [viewMode, setViewMode] = React.useState<ViewMode>("days")
  const [inputValue, setInputValue] = React.useState("")
  
  React.useEffect(() => {
    if (date && isValid(date)) {
      setViewDate(date)
      setInputValue(format(date, "dd/MM/yyyy HH:mm"))
    } else {
      setInputValue("")
    }
  }, [date])

  const formatDateTimeInput = (val: string) => {
    const digits = val.replace(/\D/g, "");
    let formatted = "";
    if (digits.length > 0) {
      formatted += digits.substring(0, 2);
      if (digits.length > 2) {
        formatted += "/" + digits.substring(2, 4);
        if (digits.length > 4) {
          formatted += "/" + digits.substring(4, 8);
          if (digits.length > 8) {
            formatted += " " + digits.substring(8, 10);
            if (digits.length > 10) {
              formatted += ":" + digits.substring(10, 12);
            }
          }
        }
      }
    }
    return formatted;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = formatDateTimeInput(e.target.value);
    setInputValue(val);

    if (val.length === 16) {
      const parsedDate = parse(val, "dd/MM/yyyy HH:mm", new Date());
      if (isValid(parsedDate)) {
        setDate(parsedDate);
        setViewDate(parsedDate);
      }
    }
  };
  
  React.useEffect(() => {
    if (isOpen) {
      setViewDate(date || new Date())
      setViewMode("days")
    }
  }, [isOpen, date])

  const handleDateSelect = (d: Date) => {
    const newDate = date 
      ? setMinutes(setHours(d, date.getHours()), date.getMinutes())
      : setHours(d, 12)
    
    setDate(newDate)
    setViewMode("time")
  }

  const handleTimeChange = (type: "hour" | "minute", value: number) => {
    const baseDate = date || new Date()
    const newDate = type === "hour" ? setHours(baseDate, value) : setMinutes(baseDate, value)
    setDate(newDate)
  }

  const nextMonth = () => setViewDate(addMonths(viewDate, 1))
  const prevMonth = () => setViewDate(subMonths(viewDate, 1))

  const years = React.useMemo(() => {
    const currentYear = new Date().getFullYear()
    const arr = []
    for (let i = currentYear + 10; i >= 1940; i--) arr.push(i)
    return arr
  }, [])

  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5)

  const daysInMonth = React.useMemo(() => {
    const start = startOfMonth(viewDate)
    const end = endOfMonth(viewDate)
    const startDay = start.getDay()
    const days = []
    const prevMonthEnd = endOfMonth(subMonths(viewDate, 1))
    for (let i = startDay - 1; i >= 0; i--) {
        days.push({ date: new Date(prevMonthEnd.getFullYear(), prevMonthEnd.getMonth(), prevMonthEnd.getDate() - i), currentMonth: false })
    }
    const interval = eachDayOfInterval({ start, end })
    interval.forEach(d => days.push({ date: d, currentMonth: true }))
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
        days.push({ date: new Date(end.getFullYear(), end.getMonth() + 1, i), currentMonth: false })
    }
    return days
  }, [viewDate])

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <div className="relative group">
        <Input
          value={inputValue}
          onChange={handleInputChange}
          placeholder="DD/MM/AAAA HH:MM"
          onClick={() => setIsOpen(true)}
          className={cn(
            "w-full h-12 pl-12 pr-10 font-black uppercase text-[11px] tracking-wider rounded-2xl bg-secondary/10 border-border focus:ring-primary/20 focus:border-primary/50 transition-all",
            date ? "text-foreground shadow-sm" : "text-muted-foreground"
          )}
        />
        
        <div className={cn(
            "absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center transition-all pointer-events-none",
            date ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-muted/10 text-muted-foreground"
        )}>
            <CalendarIcon size={16} />
        </div>

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <PopoverTrigger asChild>
                <button className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all">
                    <ChevronRight size={14} className={cn("transition-transform", isOpen && "rotate-90")} />
                </button>
            </PopoverTrigger>
        </div>
      </div>

      <PopoverContent className="w-[320px] p-0 rounded-[2rem] border-border shadow-2xl bg-card overflow-hidden" align="start">
        <div className="relative bg-gradient-to-br from-card to-secondary/20 h-[420px] flex flex-col">
          
          {/* Header */}
          <div className="p-4 flex items-center justify-between border-b border-border bg-card/50 backdrop-blur-sm z-20">
            <div className="flex gap-2">
              <button 
                onClick={() => setViewMode(viewMode === "days" ? "time" : "days")}
                className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all transition-colors",
                    viewMode !== "time" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-primary/10 hover:text-primary"
                )}
              >
                Data
              </button>
              <button 
                onClick={() => setViewMode("time")}
                className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                    viewMode === "time" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-primary/10 hover:text-primary"
                )}
              >
                Hora
              </button>
            </div>

            {viewMode !== "time" && (
                <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={prevMonth}>
                    <ChevronLeft size={16} />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={nextMonth}>
                    <ChevronRight size={16} />
                </Button>
                </div>
            )}
          </div>

          <div className="flex-1 relative overflow-hidden">
            <AnimatePresence initial={false} mode="wait">
              
              {/* DAYS VIEW */}
              {viewMode === "days" && (
                <motion.div 
                    key="days"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="p-4 flex flex-col absolute inset-0"
                >
                    <div className="flex items-center justify-between mb-2">
                         <button 
                            onClick={() => setViewMode("months")}
                            className="text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/10 px-2 py-1 rounded-lg"
                        >
                            {format(viewDate, "MMMM", { locale: ptBR })}
                        </button>
                        <button 
                            onClick={() => setViewMode("years")}
                            className="text-[10px] font-bold text-muted-foreground hover:bg-muted/10 px-2 py-1 rounded-lg"
                        >
                            {format(viewDate, "yyyy")}
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {["D", "S", "T", "Q", "Q", "S", "S"].map(d => (
                            <div key={d} className="text-center text-[9px] font-black text-primary/40 uppercase py-2">
                                {d}
                            </div>
                        ))}
                        {daysInMonth.map(({ date: d, currentMonth }, idx) => {
                            const isSelected = date && isSameDay(d, date)
                            const isToday = isSameDay(d, new Date())
                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleDateSelect(d)}
                                    className={cn(
                                        "h-8 w-8 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center relative",
                                        !currentMonth && "opacity-20",
                                        isSelected 
                                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110 z-10" 
                                            : "hover:bg-primary/10 hover:text-primary",
                                        isToday && !isSelected && "text-primary ring-1 ring-primary/30"
                                    )}
                                >
                                    {d.getDate()}
                                    {isToday && !isSelected && <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />}
                                </button>
                            )
                        })}
                    </div>
                </motion.div>
              )}

              {/* TIME VIEW */}
              {viewMode === "time" && (
                <motion.div 
                    key="time"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    className="absolute inset-0 bg-card flex flex-col"
                    onWheel={(e) => e.stopPropagation()}
                >
                    <div className="p-4 flex flex-col h-full">
                        <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                            <Clock size={12} /> Horário
                        </div>

                        <div className="flex gap-4 h-[260px]">
                            {/* Hours */}
                            <div 
                                className="flex-1 overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-1 pb-12"
                                onWheel={(e) => e.stopPropagation()}
                                onPointerDown={(e) => e.stopPropagation()}
                                tabIndex={0}
                            >
                                {hours.map(h => (
                                    <button
                                        key={h}
                                        onClick={() => handleTimeChange("hour", h)}
                                        className={cn(
                                            "h-10 shrink-0 rounded-xl font-black text-sm transition-all",
                                            date?.getHours() === h 
                                                ? "bg-primary text-primary-foreground shadow-md" 
                                                : "bg-secondary/20 hover:bg-primary/10 text-muted-foreground"
                                        )}
                                    >
                                        {h.toString().padStart(2, '0')}
                                    </button>
                                ))}
                            </div>
                            {/* Minutes */}
                            <div 
                                className="flex-1 overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-1 pb-12"
                                onWheel={(e) => e.stopPropagation()}
                                onPointerDown={(e) => e.stopPropagation()}
                                tabIndex={0}
                            >
                                {minutes.map(m => (
                                    <button
                                        key={m}
                                        onClick={() => handleTimeChange("minute", m)}
                                        className={cn(
                                            "h-10 shrink-0 rounded-xl font-black text-sm transition-all",
                                            date?.getMinutes() === m 
                                                ? "bg-primary text-primary-foreground shadow-md" 
                                                : "bg-secondary/20 hover:bg-primary/10 text-muted-foreground"
                                        )}
                                    >
                                        {m.toString().padStart(2, '0')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
              )}

              {/* MONTHS VIEW */}
              {viewMode === "months" && (
                <motion.div key="months" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 grid grid-cols-3 gap-2 absolute inset-0 bg-card overflow-y-auto custom-scrollbar">
                    {months.map((m, i) => (
                        <button key={m} onClick={() => { setViewDate(setMonth(viewDate, i)); setViewMode("days"); }} className={cn("p-3 rounded-xl text-[10px] font-black uppercase transition-all", isSameMonth(setMonth(viewDate, i), viewDate) ? "bg-primary text-primary-foreground shadow-lg" : "bg-secondary/20 hover:bg-primary/10 text-muted-foreground")}>{m}</button>
                    ))}
                </motion.div>
              )}

              {/* YEARS VIEW */}
              {viewMode === "years" && (
                <motion.div key="years" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 grid grid-cols-3 gap-2 absolute inset-0 bg-card overflow-y-auto custom-scrollbar">
                    {years.map(y => (
                        <button key={y} onClick={() => { setViewDate(setYear(viewDate, y)); setViewMode("days"); }} className={cn("p-3 rounded-xl text-[10px] font-black transition-all", viewDate.getFullYear() === y ? "bg-primary text-primary-foreground shadow-lg" : "bg-secondary/20 hover:bg-primary/10 text-muted-foreground")}>{y}</button>
                    ))}
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="p-4 bg-secondary/30 backdrop-blur-md border-t border-border flex items-center justify-between z-20">
             <Button 
                variant="ghost" 
                size="sm" 
                className="text-[9px] font-black uppercase text-primary tracking-widest gap-2"
                onClick={() => setDate(new Date())}
             >
                <Zap size={10} /> Agora
             </Button>
             
             <Button 
                onClick={() => setIsOpen(false)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-black text-[10px] uppercase h-9 px-6 rounded-xl shadow-lg shadow-primary/20"
             >
                Confirmar <Check size={12} className="ml-1" />
             </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}



