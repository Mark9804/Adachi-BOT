Vue.component("char-front", {
  template: '<img class="avatar-general" alt="ERROR"/>',
});

Vue.component("char-side-img", {
  template: '<img class="avatar-rounded" alt="ERROR"/>',
});

function imageUrlReplacement(imageURL) {
  // 把侧面转换成正面，只要把url里面所有的"_side"给删掉：注意有的S是大写有的是小写，并且不止一处
  const regex = /_side/gi;
  return imageURL.replace(regex, "");
}

Vue.component("strongest-hit", {
  template: '<img class="strongest-hit" alt="ERROR"/>',
});
