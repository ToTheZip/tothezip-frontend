export function splitPreferenceTags({ preferenceTagIds, tagOptions }) {
  let sido = "";
  let gugun = "";
  const facilityTagIds = [];

  for (const tagId of preferenceTagIds) {
    const tag = tagOptions.find((t) => t.tagId === tagId);
    if (!tag) continue;

    // 지역 태그: "서울특별시 관악구"
    if (tag.name.includes(" ") && tag.name.endsWith("구")) {
      const [s, g] = tag.name.split(" ");
      sido = s;
      gugun = g;
    } else {
      facilityTagIds.push(tagId);
    }
  }

  return {
    sido,
    gugun,
    facilityTagIds,
  };
}
