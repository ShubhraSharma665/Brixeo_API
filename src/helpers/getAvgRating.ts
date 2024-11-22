import * as _ from "lodash";

export function getAvgRatingAndCount(ratings: any) {
  if (!ratings || ratings.length <= 0) {
    return 0;
  }
  const ratingCount = ratings.length;
  const avgRating = _.reduce(
    ratings,
    (count, rating) => {
      if (!rating.rating) {
        return count;
      }
      return count + rating.rating;
    },
    0,
  );

  return {
    rating: avgRating,
    total_reviews: ratingCount,
  };
}
