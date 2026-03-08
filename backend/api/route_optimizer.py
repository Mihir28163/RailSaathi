import heapq
from typing import List, Dict, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta

@dataclass
class StationNode:
    name: str
    connections: Dict[str, Dict]  # {connected_station: {train_type, duration}}

class RouteOptimizer:
    def __init__(self):
        # Build a comprehensive Mumbai railway network graph
        self.stations = self._build_railway_network()
    
    def _build_railway_network(self) -> Dict[str, StationNode]:
        """Create a comprehensive Mumbai railway network"""
        stations = {}
        
        # Define all Mumbai local train stations and their connections
        connections = {
            # Western Line
            "Churchgate": {
                "Marine Lines": {"fast": 5, "slow": 8},
                "Charni Road": {"fast": 3, "slow": 5}
            },
            "Marine Lines": {
                "Churchgate": {"fast": 5, "slow": 8},
                "Charni Road": {"fast": 3, "slow": 5},
                "Mumbai Central": {"fast": 5, "slow": 8}
            },
            "Charni Road": {
                "Marine Lines": {"fast": 3, "slow": 5},
                "Grant Road": {"fast": 3, "slow": 5},
                "Mumbai Central": {"fast": 3, "slow": 5}
            },
            "Grant Road": {
                "Charni Road": {"fast": 3, "slow": 5},
                "Mumbai Central": {"fast": 3, "slow": 5}
            },
            "Mumbai Central": {
                "Grant Road": {"fast": 3, "slow": 5},
                "Marine Lines": {"fast": 5, "slow": 8},
                "Mahalaxmi": {"fast": 5, "slow": 8},
                "Madhav Baug": {"fast": 3, "slow": 5},
                "Sandhurst Road": {"fast": 3, "slow": 5}
            },
            "Mahalaxmi": {
                "Mumbai Central": {"fast": 5, "slow": 8},
                "Lower Parel": {"fast": 5, "slow": 8}
            },
            "Lower Parel": {
                "Mahalaxmi": {"fast": 5, "slow": 8},
                "Elphinstone Road": {"fast": 3, "slow": 5},
                "Parel": {"fast": 3, "slow": 5}
            },
            "Elphinstone Road": {
                "Lower Parel": {"fast": 3, "slow": 5},
                "Dadar": {"fast": 5, "slow": 8},
                "Parel": {"fast": 3, "slow": 5}
            },
            "Dadar": {
                "Elphinstone Road": {"fast": 5, "slow": 8},
                "Parel": {"fast": 5, "slow": 8},
                "Matunga Road": {"fast": 5, "slow": 8},
                "Kurla": {"fast": 10, "slow": 15},
                "Sion": {"fast": 8, "slow": 12},
                "Mahim": {"fast": 5, "slow": 8},
                "Matunga": {"fast": 3, "slow": 5}
            },
            "Matunga Road": {
                "Dadar": {"fast": 5, "slow": 8},
                "Mahim": {"fast": 5, "slow": 8}
            },
            "Mahim": {
                "Matunga Road": {"fast": 5, "slow": 8},
                "Bandra": {"fast": 8, "slow": 12},
                "Matunga": {"fast": 3, "slow": 5}
            },
            "Matunga": {
                "Mahim": {"fast": 3, "slow": 5},
                "Sion": {"fast": 5, "slow": 8},
                "Kurla": {"fast": 5, "slow": 8}
            },
            "Sion": {
                "Dadar": {"fast": 8, "slow": 12},
                "Kurla": {"fast": 5, "slow": 8},
                "Matunga": {"fast": 5, "slow": 8},
                "Vidyavihar": {"fast": 5, "slow": 8}
            },
            "Kurla": {
                "Dadar": {"fast": 10, "slow": 15},
                "Bandra": {"fast": 10, "slow": 15},
                "Sion": {"fast": 5, "slow": 8},
                "Vidyavihar": {"fast": 5, "slow": 8},
                "Ghatkopar": {"fast": 8, "slow": 12}
            },
            "Vidyavihar": {
                "Kurla": {"fast": 5, "slow": 8},
                "Sion": {"fast": 5, "slow": 8},
                "Ghatkopar": {"fast": 5, "slow": 8}
            },
            "Ghatkopar": {
                "Vidyavihar": {"fast": 5, "slow": 8},
                "Andheri": {"fast": 10, "slow": 15},
                "Vikhroli": {"fast": 8, "slow": 12}
            },
            "Andheri": {
                "Bandra": {"fast": 15, "slow": 20},
                "Ghatkopar": {"fast": 10, "slow": 15},
                "Vile Parle": {"fast": 5, "slow": 8},
                "Jogeshwari": {"fast": 8, "slow": 12}
            },
            "Vile Parle": {
                "Andheri": {"fast": 5, "slow": 8},
                "Santacruz": {"fast": 5, "slow": 8}
            },
            "Santacruz": {
                "Vile Parle": {"fast": 5, "slow": 8},
                "Khar Road": {"fast": 5, "slow": 8},
                "Borivali": {"fast": 15, "slow": 20}
            },
            "Khar Road": {
                "Santacruz": {"fast": 5, "slow": 8},
                "Borivali": {"fast": 8, "slow": 12}
            },
            "Borivali": {
                "Santacruz": {"fast": 15, "slow": 20},
                "Khar Road": {"fast": 8, "slow": 12},
                "Dahisar": {"fast": 10, "slow": 15},
                "Gorai": {"fast": 5, "slow": 8}
            },
            "Dahisar": {
                "Borivali": {"fast": 10, "slow": 15},
                "Mira Road": {"fast": 8, "slow": 12}
            },
            "Mira Road": {
                "Dahisar": {"fast": 8, "slow": 12},
                "Vasai Road": {"fast": 15, "slow": 20}
            },
            "Vasai Road": {
                "Mira Road": {"fast": 15, "slow": 20},
                "Nallasopara": {"fast": 10, "slow": 15}
            },
            "Nallasopara": {
                "Vasai Road": {"fast": 10, "slow": 15},
                "Bhiwandi": {"fast": 15, "slow": 20}
            },
            # Central Line
            "Chhatrapati Shivaji Terminus": {
                "Masjid Bunder": {"fast": 5, "slow": 8},
                "Sandhurst Road": {"fast": 3, "slow": 5}
            },
            "Masjid Bunder": {
                "Chhatrapati Shivaji Terminus": {"fast": 5, "slow": 8},
                "Sandhurst Road": {"fast": 3, "slow": 5}
            },
            "Sandhurst Road": {
                "Mumbai Central": {"fast": 3, "slow": 5},
                "Masjid Bunder": {"fast": 3, "slow": 5},
                "Chhatrapati Shivaji Terminus": {"fast": 3, "slow": 5}
            },
            "Parel": {
                "Lower Parel": {"fast": 3, "slow": 5},
                "Currey Road": {"fast": 3, "slow": 5},
                "Lalbaug": {"fast": 3, "slow": 5}
            },
            "Currey Road": {
                "Parel": {"fast": 3, "slow": 5},
                "Chinchpokli": {"fast": 3, "slow": 5}
            },
            "Chinchpokli": {
                "Currey Road": {"fast": 3, "slow": 5},
                "Byculla": {"fast": 3, "slow": 5}
            },
            "Byculla": {
                "Chinchpokli": {"fast": 3, "slow": 5},
                "Sandhurst Road": {"fast": 5, "slow": 8},
                "Mazgaon": {"fast": 3, "slow": 5}
            },
            "Mazgaon": {
                "Byculla": {"fast": 3, "slow": 5},
                "Sandhurst Road": {"fast": 5, "slow": 8}
            },
            "Lalbaug": {
                "Parel": {"fast": 3, "slow": 5},
                "Currey Road": {"fast": 3, "slow": 5}
            },
            # Harbour Line
            "Vashi": {
                "Sanpada": {"fast": 5, "slow": 8},
                "Nerul": {"fast": 5, "slow": 8}
            },
            "Sanpada": {
                "Vashi": {"fast": 5, "slow": 8},
                "Nerul": {"fast": 3, "slow": 5}
            },
            "Nerul": {
                "Vashi": {"fast": 5, "slow": 8},
                "Sanpada": {"fast": 3, "slow": 5},
                "Seawoods": {"fast": 5, "slow": 8}
            },
            "Belapur": {
                "Kharghar": {"fast": 5, "slow": 8},
                "Seawoods": {"fast": 5, "slow": 8}
            },
            "Kharghar": {
                "Belapur": {"fast": 5, "slow": 8},
                "Mansarovar": {"fast": 5, "slow": 8}
            },
            # Additional stations
            "Bandra": {
                "Mahim": {"fast": 8, "slow": 12},
                "Kurla": {"fast": 10, "slow": 15},
                "Andheri": {"fast": 15, "slow": 20}
            },
            "Jogeshwari": {
                "Andheri": {"fast": 8, "slow": 12},
                "Goregaon": {"fast": 8, "slow": 12}
            },
            "Goregaon": {
                "Jogeshwari": {"fast": 8, "slow": 12},
                "Malad": {"fast": 8, "slow": 12}
            },
            "Malad": {
                "Goregaon": {"fast": 8, "slow": 12},
                "Kandivali": {"fast": 5, "slow": 8}
            },
            "Kandivali": {
                "Malad": {"fast": 5, "slow": 8},
                "Borivali": {"fast": 8, "slow": 12}
            },
            "Gorai": {
                "Borivali": {"fast": 5, "slow": 8}
            },
            "Vikhroli": {
                "Ghatkopar": {"fast": 8, "slow": 12},
                "Kanjurmarg": {"fast": 5, "slow": 8}
            },
            "Kanjurmarg": {
                "Vikhroli": {"fast": 5, "slow": 8},
                "Bhandup": {"fast": 5, "slow": 8}
            },
            "Bhandup": {
                "Kanjurmarg": {"fast": 5, "slow": 8},
                "Nahur": {"fast": 5, "slow": 8}
            },
            "Nahur": {
                "Bhandup": {"fast": 5, "slow": 8},
                "Mulund": {"fast": 5, "slow": 8}
            },
            "Mulund": {
                "Nahur": {"fast": 5, "slow": 8},
                "Thane": {"fast": 10, "slow": 15}
            },
            "Thane": {
                "Mulund": {"fast": 10, "slow": 15},
                "Mumbra": {"fast": 8, "slow": 12}
            },
            "Mumbra": {
                "Thane": {"fast": 8, "slow": 12},
                "Diwa": {"fast": 5, "slow": 8}
            },
            "Diwa": {
                "Mumbra": {"fast": 5, "slow": 8},
                "Mansarovar": {"fast": 8, "slow": 12}
            },
            "Mansarovar": {
                "Diwa": {"fast": 8, "slow": 12},
                "Kharghar": {"fast": 5, "slow": 8}
            },
            "Seawoods": {
                "Nerul": {"fast": 5, "slow": 8},
                "Belapur": {"fast": 5, "slow": 8}
            },
            "Bhiwandi": {
                "Nallasopara": {"fast": 15, "slow": 20}
            }
        }
        
        for station_name, station_connections in connections.items():
            stations[station_name] = StationNode(station_name, station_connections)
        
        return stations
    
    def calculate_route_score(self, travel_time: int, crowd_density: float, 
                             delay_probability: float, transfers: int, 
                             preference: str) -> float:
        """Calculate route score based on preference"""
        if preference == "fastest":
            return 0.7 * travel_time + 0.2 * delay_probability + 0.1 * transfers
        elif preference == "comfortable":
            return 0.3 * travel_time + 0.4 * crowd_density + 0.2 * delay_probability + 0.1 * transfers
        else:  # balanced
            return (0.4 * travel_time + 
                   0.3 * crowd_density + 
                   0.2 * delay_probability + 
                   0.1 * transfers)
    
    def dijkstra_with_ml_weights(self, source: str, destination: str, 
                               target_time: datetime, preference: str,
                               ml_service) -> List[Dict]:
        """Modified Dijkstra algorithm with ML weights"""
        if source not in self.stations or destination not in self.stations:
            return []
        
        # Priority queue: (score, current_station, path, total_time, transfers)
        pq = [(0, source, [], 0, 0)]
        visited = set()
        
        while pq:
            current_score, current_station, path, total_time, transfers = heapq.heappop(pq)
            
            if current_station in visited:
                continue
                
            visited.add(current_station)
            
            if current_station == destination:
                return path + [{
                    'station': current_station,
                    'arrival_time': target_time + timedelta(minutes=total_time)
                }]
            
            for neighbor, train_options in self.stations[current_station].connections.items():
                if neighbor in visited:
                    continue
                
                # Try both fast and slow trains
                for train_type, duration in train_options.items():
                    # Get ML predictions for this segment
                    crowd_pred = ml_service.predict_crowd(current_station, train_type, target_time)
                    delay_pred = ml_service.predict_delay(current_station, train_type, target_time)
                    
                    crowd_density = crowd_pred.get("index", 50)
                    delay_probability = delay_pred.get("probability", 10)
                    
                    # Calculate segment score
                    segment_score = self.calculate_route_score(
                        duration, crowd_density, delay_probability, 
                        transfers + (1 if train_type == "slow" else 0), preference
                    )
                    
                    new_total_time = total_time + duration
                    new_transfers = transfers + (1 if train_type == "slow" else 0)
                    new_score = current_score + segment_score
                    
                    new_path = path + [{
                        'from': current_station,
                        'to': neighbor,
                        'train_type': train_type,
                        'duration': duration,
                        'departure_time': target_time + timedelta(minutes=total_time),
                        'arrival_time': target_time + timedelta(minutes=new_total_time),
                        'crowd_density': crowd_density,
                        'delay_probability': delay_probability
                    }]
                    
                    heapq.heappush(pq, (new_score, neighbor, new_path, new_total_time, new_transfers))
        
        return []
