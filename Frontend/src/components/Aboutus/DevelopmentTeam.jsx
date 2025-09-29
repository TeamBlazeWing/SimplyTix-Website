import { FaLaptopCode, FaCode, FaDatabase, FaPalette, FaMobile } from "react-icons/fa6";
import "./styles.css";

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

const DevelopmentTeam = () => {
  return (
    <div className="w-full max-w-6xl mx-auto mb-16 px-4">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-white mb-6 animate-fade-in-up">
          Meet Our <span className="gradient-text">Development Team</span>
        </h2>
        <p className="text-gray-300 text-lg mb-8 max-w-3xl mx-auto leading-relaxed">
          Our passionate team of developers, designers, and engineers who bring SimplyTix to life.
          We combine creativity with cutting-edge technology to deliver exceptional user experiences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {developmentTeam.map((member, index) => (
          <div
            key={index}
            className="glass-effect rounded-2xl p-8 text-center hover-scale group relative overflow-hidden"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="relative z-10">
              {/* Profile Image */}
              <div className="relative mb-6">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-28 h-28 rounded-full mx-auto object-cover border-4 border-white/20 group-hover:border-white/40 transition-all duration-300 group-hover:scale-105"
                />
                <div className="absolute -bottom-2 -right-2 p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
                  {member.icon}
                </div>
              </div>

              {/* Member Info */}
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300">
                {member.name}
              </h3>
              <p className="text-blue-400 font-semibold text-lg mb-3">{member.role}</p>
              <p className="text-gray-300 text-sm mb-4">{member.specialty}</p>
              <p className="text-gray-400 text-sm mb-6">{member.experience}</p>

              {/* Skills */}
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {member.skills.map((skill, skillIndex) => (
                  <span
                    key={skillIndex}
                    className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-3 py-1 rounded-full text-xs font-semibold text-blue-300 border border-blue-400/30"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Social Links */}
              <div className="flex justify-center space-x-4 mt-6">
                <button className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors">
                  <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286z"/>
                  </svg>
                </button>
                <button className="p-2 bg-gray-500/20 hover:bg-gray-500/30 rounded-lg transition-colors">
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DevelopmentTeam;