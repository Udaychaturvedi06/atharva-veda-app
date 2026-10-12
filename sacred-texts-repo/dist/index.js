// divine-books bundled data module
const createVedaEngine = (name, books) => ({
  name,
  books,
  all: () => books,
  book: (b) => books.find(x => x.book_number === b || x.book === b) || null,
  hymn: (b, h) => {
    const bk = books.find(x => x.book_number === b || x.book === b);
    if (!bk) return null;
    return (bk.hymns || bk.suktas || []).find(x => x.hymn_number === h || x.hymn === h) || null;
  },
  verse: (b, h, v) => {
    const bk = books.find(x => x.book_number === b || x.book === b);
    if (!bk) return null;
    const hm = (bk.hymns || bk.suktas || []).find(x => x.hymn_number === h || x.hymn === h);
    if (!hm) return null;
    return (hm.verses || []).find(x => x.verse_number === v || x.verse === v) || null;
  }
});

const rigBooks = [
  {
    book_number: 1,
    title: "Agni Suktas & Cosmic Visions",
    hymns: [
      {
        hymn_number: 1,
        verses: [
          { verse_number: 1, sanskrit: "अग्निमीळे पुरोहितं यज्ञस्य देवमृत्विजम् | होतारं रत्नधातमम् ||" },
          { verse_number: 2, sanskrit: "अग्निः पूर्वेभिरृषिभिरीड्यो नूतनैरुत | स देवाँ एह वक्षति ||" },
          { verse_number: 3, sanskrit: "अग्निना रयिमश्नवत्पोषमेव दिवेदिवे | यशसं वीरवत्तमम् ||" }
        ]
      },
      {
        hymn_number: 2,
        verses: [
          { verse_number: 1, sanskrit: "वायवा याहि दर्शतेमे सोमा अरंकृताः | तेषां पाहि श्रुधी हवम् ||" }
        ]
      },
      {
        hymn_number: 3,
        verses: [
          { verse_number: 1, sanskrit: "अश्विना यज्वरीरिषो द्रवत्पाणी शुभस्पती | पुरुभुजा चनस्यतम् ||" },
          { verse_number: 2, sanskrit: "अश्विना पुरुदंससा नरा शवीरया धिया | धिष्ण्या वनतं गिरः ||" }
        ]
      }
    ]
  },
  {
    book_number: 3,
    title: "Gayatri & Solar Illumination",
    hymns: [
      {
        hymn_number: 62,
        verses: [
          { verse_number: 10, sanskrit: "ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात् ||" }
        ]
      }
    ]
  },
  {
    book_number: 10,
    title: "Nasadiya & Purusha Hymns",
    hymns: [
      {
        hymn_number: 90,
        verses: [
          { verse_number: 1, sanskrit: "सहस्रशीर्षा पुरुषः सहस्राक्षः सहस्रपात् | स भूमिं विश्वतो वृत्वात्यतिष्ठद्दशाङ्गुलम् ||" }
        ]
      },
      {
        hymn_number: 129,
        verses: [
          { verse_number: 1, sanskrit: "नासदासीन्नो सदासीत्तदानीं नासीद्रजो नो व्योमा परो यत् |" }
        ]
      }
    ]
  }
];

const atharvaBooks = [
  {
    book_number: 1,
    title: "Medha & Healing Prayers",
    hymns: [
      {
        hymn_number: 1,
        verses: [
          { verse_number: 1, sanskrit: "ये त्रिषप्ताः परियन्ति विश्वा रूपाणि बिभ्रतः | वाचस्पतिर्बला तेषां तन्वो अद्य दधातु मे ||" }
        ]
      }
    ]
  },
  {
    book_number: 12,
    title: "Prithvi Sukta (Ode to Mother Earth)",
    hymns: [
      {
        hymn_number: 1,
        verses: [
          { verse_number: 1, sanskrit: "सत्यं बृहदृतमुग्रं दीक्षा तपो ब्रह्म यज्ञः पृथिवीं धारयन्ति | सा नो भूतस्य भव्यस्य पत्न्युरुं लोकं पृथिवी नः कृणोतु ||" },
          { verse_number: 12, sanskrit: "माता भूमिः पुत्रो अहं पृथिव्याः पर्जन्यः पिता स उ नः पिपर्तु ||" }
        ]
      }
    ]
  },
  {
    book_number: 9,
    title: "Kama & Creation Mysticism",
    hymns: [
      {
        hymn_number: 2,
        verses: [
          { verse_number: 1, sanskrit: "सपत्नहनमृषभो घृतेन कामं म आवपन्तु देवाः |" },
          { verse_number: 2, sanskrit: "इन्द्र उक्थामदानि यज्ञे अस्मिन् प्रविद्वान् युनक्तु सुयुजः स्वाहा |" }
        ]
      }
    ]
  }
];

const samaBooks = [
  {
    book_number: 1,
    title: "Purvarchika (Sacred Melodies to Agni & Indra)",
    hymns: [
      {
        hymn_number: 1,
        verses: [
          { verse_number: 1, sanskrit: "अग्न आयाहि वीतये गृणानो हव्यदातये | नि होता सत्सि बर्हिषि ||" }
        ]
      }
    ]
  },
  {
    book_number: 2,
    title: "Uttararchika (Songs of Transcendental Joy)",
    hymns: [
      {
        hymn_number: 1,
        verses: [
          { verse_number: 1, sanskrit: "पवस्व सोम मन्दयन्निन्द्राय मधुमत्तमः |" }
        ]
      }
    ]
  }
];

export const RigVeda = createVedaEngine("Rigveda", rigBooks);
export const Atharvaveda = createVedaEngine("Atharvaveda", atharvaBooks);
export const Samaveda = createVedaEngine("Samaveda", samaBooks);

const divineBooks = {
  RigVeda,
  Atharvaveda,
  Samaveda
};

export default divineBooks;
