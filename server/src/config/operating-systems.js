/**
 * Operating Systems Configuration
 */

const operatingSystems = {
  linux: {
    name: "Linux",
    nameFA: "لینوکس",
    types: [
      {
        id: "ubuntu",
        name: "Ubuntu",
        nameFA: "اوبونتو",
        versions: [
          {
            id: "ubuntu-24",
            version: "24.04",
            codeName: "Noble Numbat",
            name: "Ubuntu 24.04",
            nameFA: "اوبونتو ورژن 24",
          },
          {
            id: "ubuntu-22",
            version: "22.04",
            codeName: "Jammy Jellyfish",
            name: "Ubuntu 22.04",
            nameFA: "اوبونتو ورژن 22",
          },
          {
            id: "ubuntu-20",
            version: "20.04",
            codeName: "Focal Fossa",
            name: "Ubuntu 20.04",
            nameFA: "اوبونتو ورژن 20",
          },
        ],
      },
      {
        id: "debian",
        name: "Debian",
        nameFA: "دبین",
        versions: [
          {
            id: "debian-12",
            version: "12",
            codeName: "Bookworm",
            name: "Debian 12",
            nameFA: "دبین ورژن 12",
          },
          {
            id: "debian-11",
            version: "11",
            codeName: "Bullseye",
            name: "Debian 11",
            nameFA: "دبین ورژن 11",
          },
          {
            id: "debian-10",
            version: "10",
            codeName: "Buster",
            name: "Debian 10",
            nameFA: "دبین ورژن 10",
          },
        ],
      },
    ],
  },
  windows: {
    name: "Windows",
    nameFA: "ویندوز",
    types: [
      {
        id: "windows-server",
        name: "Windows Server",
        nameFA: "ویندوز سرور",
        versions: [
          {
            id: "windows-server-2025",
            version: "2025",
            name: "Windows Server 2025",
            nameFA: "ویندوز سرور ورژن 2025",
          },
          {
            id: "windows-server-2022",
            version: "2022",
            name: "Windows Server 2022",
            nameFA: "ویندوز سرور ورژن 2022",
          },
          {
            id: "windows-server-2",
            version: "2",
            name: "Windows Server 2",
            nameFA: "ویندوز سرور ورژن 2",
          },
        ],
      },
    ],
  },
};

module.exports = operatingSystems;
