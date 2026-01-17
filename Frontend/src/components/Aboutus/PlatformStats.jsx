import { FaCalendar, FaTicket, FaUsers, FaHeart, FaLaptopCode, FaCode, FaDatabase, FaPalette, FaMobile } from "react-icons/fa6";
import "./styles.css";
import { useEffect, useState } from "react";

const developmentTeam = [
  {
    name: "Rashmika Rathnayaka",
    role: "Full Stack Developer",
    experience: "5+ years",
    specialty: "React & Node.js",
    image: "https://media.licdn.com/dms/image/v2/D5603AQHVhCURXlAjWA/profile-displayphoto-scale_400_400/B56ZhLu6wJHcAk-/0/1753617248734?e=1757548800&v=beta&t=cOul1iaYCY6t9y4INEQMGjC3oKE_6f34cq36MRR6DMA",
    skills: ["Frontend", "Backend", "Database"],
    icon: <FaLaptopCode className="text-blue-400" />,
  },
  {
    name: "Suraja Hasarinda",
    role: "Full Stack Developer",
    experience: "4+ years",
    specialty: "React & UI/UX",
    image: "https://media.licdn.com/dms/image/v2/D5603AQHZBOKb_UO_MQ/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1719512611417?e=1757548800&v=beta&t=7HGVybDyMTFnXoF_OerUDcGqcPocivqLLOYqg-SnuOU",
    skills: ["React", "TypeScript", "Node.js"],
    icon: <FaCode className="text-green-400" />,
  },
  {
    name: "Umesha Jayakody",
    role: "Backend Developer",
    experience: "6+ years",
    specialty: "Node.js & APIs",
    image: "https://media.licdn.com/dms/image/v2/D4D03AQHm-MIneNhmTg/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1709138021065?e=1757548800&v=beta&t=oknH3NLmJURlPleDQRpEFvfiUDcK7Fq0gc1NjRvRnGc",
    skills: ["Node.js", "MongoDB", "APIs"],
    icon: <FaDatabase className="text-purple-400" />,
  },
  {
    name: "Sithum Wickremanayake",
    role: "Full Stack Developer",
    experience: "4+ years",
    specialty: "Design & Prototyping",
    image: "https://res.cloudinary.com/djuczs6nf/image/upload/v1754364195/mqmqkkkd2gcbg5fyvonk.png",
    skills: ["ReactNative", "Node.js", "React"],
    icon: <FaCode className="text-green-400" />,
  }
];

const PlatformStats = ({ stats, loading }) => {
  const [eventCount, setEventCount] = useState(0);
  const [ticketCount, setTicketCount] = useState(0);

  useEffect(() => {
    const fetchEventCount = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          console.error("Authorization token is missing.");
          return;
        }

        const response = await fetch("http://167.71.220.214:3000/api/events", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok && data.success && Array.isArray(data.data)) {
          setEventCount(data.data.length);
        } else {
          console.error("Failed to fetch events count:", data.message || "Unknown error");
        }
      } catch (error) {
        console.error("Error fetching events count:", error);
      }
    };

    const fetchTicketCount = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          console.error("Authorization token is missing.");
          return;
        }

        const response = await fetch("http://167.71.220.214:3000/api/tickets/count", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok && data.success) {
          setTicketCount(data.totalTickets);
        } else {
          console.error("Failed to fetch ticket count:", data.message || "Unknown error");
        }
      } catch (error) {
        console.error("Error fetching ticket count:", error);
      }
    };

    fetchEventCount();
    fetchTicketCount();
  }, []);

  const statsConfig = [
    {
      icon: <FaCalendar className="text-4xl text-blue-400" />,
      number: eventCount,
      label: "Total Events",
      description: "Events hosted on our platform",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: <FaTicket className="text-4xl text-green-400" />,
      number: ticketCount,
      label: "Tickets Sold",
      description: "Happy customers served",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: <FaUsers className="text-4xl text-purple-400" />,
      number: developmentTeam.length,
      label: "Team Members",
      description: "Dedicated developers",
      gradient: "from-purple-500 to-violet-500",
    },
    {
      icon: <FaHeart className="text-4xl text-pink-400" />,
      number: "99%",
      label: "Satisfaction",
      description: "User satisfaction rate",
      gradient: "from-pink-500 to-rose-500",
    },
  ];

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto mb-16 px-4">
        <h2 className="text-4xl font-bold text-white text-center mb-12">Platform Impact</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-effect rounded-2xl p-8 text-center animate-pulse">
              <div className="w-16 h-16 bg-gray-600 rounded-full mx-auto mb-6"></div>
              <div className="h-8 bg-gray-600 rounded mb-4"></div>
              <div className="h-4 bg-gray-700 rounded mb-2"></div>
              <div className="h-3 bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto mb-16 px-4">
      <h2 className="text-4xl font-bold text-white text-center mb-12 animate-fade-in-up">
        Platform <span className="gradient-text">Impact</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {statsConfig.map((stat, index) => (
          <div
            key={index}
            className="glass-effect rounded-2xl p-8 text-center hover-scale group relative overflow-hidden"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Gradient background on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

            <div className="relative z-10">
              <div className="flex justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {stat.icon}
              </div>
              <h3 className="text-4xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
                {typeof stat.number === "number" ? stat.number.toLocaleString() : stat.number}
              </h3>
              <h4 className="text-xl font-semibold text-white mb-3">{stat.label}</h4>
              <p className="text-gray-300 text-sm leading-relaxed">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlatformStats;