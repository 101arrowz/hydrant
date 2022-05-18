import { Timeslot, NonClass, Activity } from "./activity";
import { scheduleSlots } from "./calendarSlots";
import { RawClass, Class, Section, Sections } from "./class";
import { sum, chooseColors } from "./utils";

/** React / localStorage state. */
export type FirehoseState = {
  selectedActivities: Array<Activity>;
  viewedActivity: Activity | undefined;
  selectedOption: number;
  totalOptions: number;
  units: number;
  hours: number;
  warnings: Array<string>;
};

/**
 * Global Firehose object. Maintains global program state (selected classes,
 * schedule options selected, activities, etc.).
 *
 * TODO: serialize/deserialize into localStorage.
 * TODO: serialize into urls too?
 * TODO: rename class to activity when needed.
 */
export class Firehose {
  /** Map from class number to Class object. */
  classes: Map<string, Class>;
  /** Possible section choices. */
  options: Array<Array<Section>> = [[]];
  /** Current number of schedule conflicts. */
  conflicts: number = 0;

  // The following are React state, so should be private. Even if we pass the
  // Firehose object to React components, they shouldn't be looking at these
  // directly; they should have it passed down to them as props from App.
  //
  // All of our program state is on this level as well; a user's schedule is
  // determined by the current term (which determines rawClasses and therefore
  // classes), plus the selected activities. So to save/load schedules, all we
  // need is to save/load selected activities.

  /** Activity whose description is being viewed. */
  private viewedActivity: Activity | undefined;
  /** Selected class activities. */
  private selectedClasses: Array<Class> = [];
  /** Selected non-class activities. */
  private selectedNonClasses: Array<NonClass> = [];
  /** Selected schedule option; zero-indexed. */
  private selectedOption: number = 0;

  /** React callback to update state. */
  callback: ((state: FirehoseState) => void) | undefined;
  /** React callback to update fits schedule filter. */
  fitsScheduleCallback: (() => void) | undefined;

  constructor(rawClasses: Map<string, RawClass>) {
    this.classes = new Map();
    rawClasses.forEach((cls, number) => {
      this.classes.set(number, new Class(cls));
    });
  }

  /** All activities. */
  get selectedActivities(): Array<Activity> {
    return [...this.selectedClasses, ...this.selectedNonClasses];
  }

  ///////////////////////
  // Activity handlers //
  ///////////////////////

  /** Set the current class description being viewed. */
  setViewedActivity(cls: Activity | undefined): void {
    this.viewedActivity = cls;
    this.updateState();
  }

  /** @returns True if activity is one of the currently selected activities. */
  isSelectedActivity(activity: Activity): boolean {
    return this.selectedActivities.some(
      (activity_) => activity_.id === activity.id
    );
  }

  /**
   * Adds an activity, selects it, and updates.
   *
   * @param activity - Activity to be added. If null, creates a new NonClass
   *   and adds it.
   */
  addActivity(activity?: Activity): void {
    const toAdd = activity ?? new NonClass();
    this.setViewedActivity(toAdd);
    if (this.isSelectedActivity(toAdd)) return;
    if (toAdd instanceof Class) {
      this.selectedClasses.push(toAdd);
    } else {
      this.selectedNonClasses.push(toAdd);
    }
    this.updateActivities();
    this.fitsScheduleCallback?.();
  }

  /** Remove an activity and update. */
  removeActivity(activity: Activity): void {
    if (!this.isSelectedActivity(activity)) return;
    if (activity instanceof Class) {
      this.selectedClasses = this.selectedClasses.filter(
        (activity_) => activity_.id !== activity.id
      );
    } else {
      this.selectedNonClasses = this.selectedNonClasses.filter(
        (activity_) => activity_.id !== activity.id
      );
    }
    this.updateActivities();
    this.fitsScheduleCallback?.();
  }

  /** Add activity if it exists, remove if it doesn't. */
  toggleActivity(activity?: Activity): void {
    if (!activity) return;
    this.isSelectedActivity(activity)
      ? this.removeActivity(activity)
      : this.addActivity(activity);
  }

  ///////////////////////
  // NonClass handlers //
  ///////////////////////

  /** Rename a given non-activity. */
  renameNonClass(nonClass: NonClass, name: string): void {
    const nonClass_ = this.selectedNonClasses.find(
      (nonClass_) => nonClass_.id === nonClass.id
    )!;
    nonClass_.name = name;
    this.updateState();
  }

  /** Add the timeslot to currently viewed activity. */
  addTimeslot(nonClass: NonClass, slot: Timeslot): void {
    nonClass.addTimeslot(slot);
    this.updateActivities();
    this.fitsScheduleCallback?.();
  }

  /** Remove all equal timeslots from currently viewed activity. */
  removeTimeslot(nonClass: NonClass, slot: Timeslot): void {
    nonClass.removeTimeslot(slot);
    this.updateActivities();
    this.fitsScheduleCallback?.();
  }

  /**
   * Lock a specific section of a class. This is here (as opposed to in the
   * Sections class) because we need to update the React state after this,
   * and only Firehose should update the React state.
   */
  lockSection(secs: Sections, sec: Section | "auto" | "none"): void {
    if (sec === "auto") {
      secs.locked = false;
    } else if (sec === "none") {
      secs.locked = true;
      secs.selected = null;
    } else {
      secs.locked = true;
      secs.selected = sec;
    }
    this.updateActivities();
  }

  //////////////////////
  // State management //
  //////////////////////

  /** Update React state by calling React callback. */
  updateState(): void {
    this.callback?.({
      selectedActivities: this.selectedActivities,
      viewedActivity: this.viewedActivity,
      selectedOption: this.selectedOption,
      totalOptions: this.options.length,
      units: sum(this.selectedClasses.map((cls) => cls.totalUnits)),
      hours: sum(this.selectedActivities.map((activity) => activity.hours)),
      warnings: [], // TODO
    });
  }

  /**
   * Change the current section of each class to match this.options[index].
   * If index does not exist, change it to this.options[0].
   */
  selectOption(index?: number): void {
    this.selectedOption = (this.options[index ?? 0]) ? (index ?? 0) : 0;
    for (const sec of this.options[this.selectedOption]) {
      sec.secs.selected = sec;
    }
    this.updateState();
  }

  /**
   * Update selected activities: reschedule them and assign colors. Call after
   * every update of this.selectedClasses or this.selectedActivities.
   *
   * TODO: measure performance; if it takes a hit, then add option to only
   *    reschedule slash recolor.
   */
  updateActivities(): void {
    chooseColors(this.selectedActivities);
    const result = scheduleSlots(this.selectedClasses, this.selectedNonClasses);
    this.options = result.options;
    this.conflicts = result.conflicts;
    this.selectOption();
  }

  /**
   * Does {@param cls} fit into current schedule without increasing conflicts?
   * Used for the "fits schedule" filter in ClassTable. Might be slow; careful
   * with using this too frequently.
   *
   * TODO: measure performance
   */
  fitsSchedule(cls: Class): boolean {
    return (
      !this.isSelectedActivity(cls) &&
      (cls.sections.length === 0 ||
        this.selectedClasses.length === 0 ||
        scheduleSlots(
          this.selectedClasses.concat([cls]),
          this.selectedNonClasses
        ).conflicts === this.conflicts)
    );
  }
}
