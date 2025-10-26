import { differenceInDays } from "date-fns";

function useCalculateNights({
  checkinDate,
  checkoutDate,
}: {
  checkinDate?: Date;
  checkoutDate?: Date;
}) {
  if (!checkinDate || !checkoutDate) return 0;
  return differenceInDays(checkoutDate, checkinDate);
}

export default useCalculateNights;
