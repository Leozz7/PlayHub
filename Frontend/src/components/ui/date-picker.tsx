"use client"

import * as React from "react"
import { format, parseISO, isValid, addMonths, subMonths, setYear, setMonth, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, parse } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon, X, ChevronLeft, ChevronRight, Zap } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value?: string | Date
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

type ViewMode = "days" | "months" | "years"

export function DatePicker({
  value,
  onChange,
  placeholder = "Selecione uma data",
  className,
  disabled
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [viewDate, setViewDate] = React.useState(new Date())
  const [viewMode, setViewMode] = React.useState<ViewMode>("days")
  const [inputValue, setInputValue] = React.useState("")
  
  const selectedDate = React.useMemo(() => {
    if (!value) return undefined
    if (value instanceof Date) return value
    const parsed = parseISO(value)
    return isValid(parsed) ? parsed : undefined
  }, [value])

  React.useEffect(() => {
    if (selectedDate) {
      setViewDate(selectedDate)
      setInputValue(format(selectedDate, "dd/MM/yyyy"))
    } else {
      setInputValue("")
    }
  }, [selectedDate])

  const formatDateInput = (val: string) => {
    const digits = val.replace(/\D/g, "");
    let formatted = "";
    if (digits.length > 0) {
      formatted += digits.substring(0, 2);
      if (digits.length > 2) {
        formatted += "/" + digits.substring(2, 4);
        if (digits.length > 4) {
          formatted += "/" + digits.substring(4, 8);
        }
      }
    }
    return formatted;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = formatDateInput(e.target.value);
    setInputValue(val);

    if (val.length === 10) {
      const parsedDate = parse(val, "dd/MM/yyyy", new Date());
      if (isValid(parsedDate)) {
        onChange(format(parsedDate, "yyyy-MM-dd"));
        setViewDate(parsedDate);
      }
    }
  };

  React.useEffect(() => {
    if (isOpen && selectedDate) {
      setViewDate(selectedDate)
    } else if (isOpen) {
      setViewDate(new Date())
    }
    if (!isOpen) {
      setViewMode("days")
    }
  }, [isOpen, selectedDate])

  const handleDateSelect = (date: Date) => {
    onChange(format(date, "yyyy-MM-dd"))
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange("")
  }

  const nextMonth = () => setViewDate(addMonths(viewDate, 1))
  const prevMonth = () => setViewDate(subMonths(viewDate, 1))

  const years = React.useMemo(() => {
    const currentYear = new Date().getFullYear()
    const startYear = 1940
    const endYear = currentYear + 10
    const arr = []
    for (let i = endYear; i >= startYear; i--) arr.push(i)
    return arr
  }, [])

  const months = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez"
  ]

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
      <div className={cn("relative group", className)}>
        <Input
          disabled={disabled}
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          onClick={() => !disabled && setIsOpen(true)}
          className={cn(
            "w-full h-12 pl-12 pr-10 font-black uppercase text-[11px] tracking-wider rounded-2xl bg-secondary/10 border-border focus:ring-primary/20 focus:border-primary/50 transition-all",
            selectedDate ? "text-foreground shadow-sm" : "text-muted-foreground"
          )}
        />
        
        <div className={cn(
          "absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center transition-all pointer-events-none",
          selectedDate ? "bg-[#8CE600] text-gray-950 shadow-lg shadow-[#8CE600]/20" : "bg-muted/10 text-muted-foreground"
        )}>
          <CalendarIcon size={16} />
        </div>

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {selectedDate && !disabled && (
            <button 
              onClick={handleClear}
              className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
            >
              <X size={14} />
            </button>
          )}
          <PopoverTrigger asChild>
            <button 
                disabled={disabled}
                className="p-1.5 rounded-lg hover:bg-[#8CE600]/10 text-muted-foreground hover:text-[#8CE600] transition-all"
            >
                <ChevronRight size={14} className={cn("transition-transform", isOpen && "rotate-90")} />
            </button>
          </PopoverTrigger>
        </div>
      </div>

      <PopoverContent className="w-[300px] p-0 rounded-[2.5rem] border-border shadow-2xl bg-card overflow-hidden" align="start">
        <div className="relative bg-gradient-to-br from-card to-[#8CE600]/5 h-[380px] flex flex-col">
          
          {/* Custom Header */}
          <div className="p-4 flex items-center justify-between border-b border-border bg-card/50 backdrop-blur-sm z-20">
            <div className="flex flex-col">
              <button 
                onClick={() => setViewMode(viewMode === "months" ? "days" : "months")}
                className="text-xs font-black uppercase tracking-widest text-[#8CE600] flex items-center gap-1 hover:bg-[#8CE600]/10 px-2 py-1 rounded-lg transition-colors"
              >
                {format(viewDate, "MMMM", { locale: ptBR })}
                <ChevronRight size={10} className={cn("transition-transform", viewMode === "months" ? "rotate-90" : "")} />
              </button>
              <button 
                onClick={() => setViewMode(viewMode === "years" ? "days" : "years")}
                className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 hover:bg-muted/10 px-2 py-0.5 rounded-md transition-colors"
              >
                {format(viewDate, "yyyy")}
                <ChevronRight size={8} className={cn("transition-transform", viewMode === "years" ? "rotate-90" : "")} />
              </button>
            </div>

            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-[#8CE600]/10 hover:text-[#8CE600]" onClick={prevMonth}>
                <ChevronLeft size={16} />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-[#8CE600]/10 hover:text-[#8CE600]" onClick={nextMonth}>
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>

          {/* View Area with AnimatePresence */}
          <div className="flex-1 relative overflow-hidden">
            <AnimatePresence initial={false} mode="wait">
              
              {/* DAYS VIEW */}
              {viewMode === "days" && (
                <motion.div 
                    key="days"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    className="p-4 grid grid-cols-7 gap-1 absolute inset-0"
                >
                    {["D", "S", "T", "Q", "Q", "S", "S"].map(d => (
                        <div key={d} className="text-center text-[9px] font-black text-[#8CE600]/40 uppercase py-2 tracking-tighter">
                            {d}
                        </div>
                    ))}
                    {daysInMonth.map(({ date, currentMonth }, idx) => {
                        const isSelected = selectedDate && isSameDay(date, selectedDate)
                        const isToday = isSameDay(date, new Date())
                        
                        return (
                            <button
                                key={idx}
                                onClick={() => handleDateSelect(date)}
                                className={cn(
                                    "h-8 w-8 rounded-lg text-[11px] font-bold transition-all relative flex items-center justify-center",
                                    !currentMonth && "opacity-20",
                                    isSelected 
                                        ? "bg-[#8CE600] text-gray-950 shadow-lg shadow-[#8CE600]/30 scale-110 z-10 font-black" 
                                        : "hover:bg-[#8CE600]/10 hover:text-[#8CE600]",
                                    isToday && !isSelected && "text-[#8CE600] ring-1 ring-[#8CE600]/30"
                                )}
                            >
                                {date.getDate()}
                                {isToday && !isSelected && <div className="absolute bottom-1 w-1 h-1 rounded-full bg-[#8CE600]" />}
                            </button>
                        )
                    })}
                </motion.div>
              )}

              {/* MONTHS VIEW */}
              {viewMode === "months" && (
                <motion.div 
                    key="months"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    className="absolute inset-0 bg-card overflow-y-auto custom-scrollbar"
                >
                    <div className="p-4 grid grid-cols-3 gap-2">
                      {months.map((m, i) => {
                           const isCurrent = isSameMonth(setMonth(viewDate, i), viewDate)
                           return (
                              <button
                                  key={m}
                                  onClick={() => { setViewDate(setMonth(viewDate, i)); setViewMode("days"); }}
                                  className={cn(
                                      "p-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                      isCurrent 
                                          ? "bg-[#8CE600] text-gray-950 shadow-lg shadow-[#8CE600]/20" 
                                          : "bg-secondary/20 hover:bg-[#8CE600]/10 hover:text-[#8CE600] text-muted-foreground"
                                  )}
                              >
                                  {m}
                              </button>
                           )
                      })}
                    </div>
                </motion.div>
              )}

              {/* YEARS VIEW */}
              {viewMode === "years" && (
                <motion.div 
                    key="years"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    className="absolute inset-0 bg-card overflow-y-auto custom-scrollbar"
                >
                    <div className="p-4 grid grid-cols-3 gap-2">
                      {years.map(y => {
                          const isCurrent = viewDate.getFullYear() === y
                          return (
                              <button
                                  key={y}
                                  onClick={() => { setViewDate(setYear(viewDate, y)); setViewMode("months"); }}
                                  className={cn(
                                      "p-3 rounded-xl text-[10px] font-black transition-all",
                                      isCurrent 
                                          ? "bg-[#8CE600] text-gray-950 shadow-lg shadow-[#8CE600]/20" 
                                          : "bg-secondary/20 hover:bg-[#8CE600]/10 hover:text-[#8CE600] text-muted-foreground"
                                  )}
                              >
                                  {y}
                              </button>
                          )
                      })}
                    </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Actions Footer */}
          <div className="p-3 bg-secondary/30 backdrop-blur-md border-t border-border flex items-center justify-between z-20">
             <Button 
                variant="ghost" 
                size="sm" 
                className="text-[9px] font-black uppercase text-[#8CE600] tracking-widest gap-2 hover:bg-[#8CE600]/10"
                onClick={() => handleDateSelect(new Date())}
             >
                <Zap size={10} /> Hoje
             </Button>
             
             <div className="flex gap-2">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted/10"
                    onClick={() => setIsOpen(false)}
                >
                    Fechar
                </Button>
             </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}



