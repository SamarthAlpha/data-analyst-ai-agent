import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from scipy import stats
import warnings
warnings.filterwarnings('ignore')

class InsightsEngine:
    def __init__(self):
        self.significance_level = 0.05
        
    def generate_chart_insights(self, df: pd.DataFrame, chart_type: str, chart_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate comprehensive insights for any chart"""
        try:
            if chart_type == "survival_analysis":
                return self._analyze_survival_insights(df, chart_data)
            elif chart_type == "age_analysis":
                return self._analyze_age_insights(df, chart_data)
            elif chart_type == "gender_analysis":
                return self._analyze_gender_insights(df, chart_data)
            elif chart_type == "class_analysis":
                return self._analyze_class_insights(df, chart_data)
            elif chart_type == "histogram":
                return self._analyze_histogram_insights(df, chart_data)
            elif chart_type == "categorical":
                return self._analyze_categorical_insights(df, chart_data)
            elif chart_type == "correlation":
                return self._analyze_correlation_insights(df, chart_data)
            else:
                return self._generate_generic_insights(df, chart_data)
        except Exception as e:
            return {
                "key_findings": [f"Unable to generate insights: {str(e)}"],
                "statistical_significance": "Not calculated",
                "trends": [],
                "comparisons": [],
                "business_recommendations": []
            }
    
    def _analyze_survival_insights(self, df: pd.DataFrame, chart_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze survival data insights"""
        try:
            total_passengers = len(df)
            survived = df[df['Survived'] == 1].shape[0]
            died = df[df['Survived'] == 0].shape[0]
            survival_rate = (survived / total_passengers) * 100
            
            # Statistical analysis
            chi2_stat, p_value = self._chi_square_test(df, 'Survived', 'Pclass')
            significance = "Statistically significant" if p_value < self.significance_level else "Not statistically significant"
            
            # Class-wise survival analysis
            class_survival = df.groupby('Pclass')['Survived'].agg(['count', 'sum', 'mean']).round(3)
            best_class = class_survival['mean'].idxmax()
            worst_class = class_survival['mean'].idxmin()
            
            # Gender analysis if available
            gender_insights = []
            if 'Sex' in df.columns:
                gender_survival = df.groupby('Sex')['Survived'].mean()
                female_rate = gender_survival.get('female', 0) * 100
                male_rate = gender_survival.get('male', 0) * 100
                gender_insights = [
                    f"Female survival rate: {female_rate:.1f}%",
                    f"Male survival rate: {male_rate:.1f}%",
                    f"Gender survival gap: {abs(female_rate - male_rate):.1f} percentage points"
                ]
            
            return {
                "key_findings": [
                    f"Overall survival rate: {survival_rate:.1f}% ({survived:,} out of {total_passengers:,} passengers)",
                    f"Class {best_class} had the highest survival rate: {class_survival.loc[best_class, 'mean']*100:.1f}%",
                    f"Class {worst_class} had the lowest survival rate: {class_survival.loc[worst_class, 'mean']*100:.1f}%",
                    f"Survival rate variation by class: {(class_survival['mean'].max() - class_survival['mean'].min())*100:.1f} percentage points"
                ] + gender_insights,
                
                "statistical_significance": {
                    "test": "Chi-square test (Survival vs Class)",
                    "p_value": f"{p_value:.4f}",
                    "result": significance,
                    "interpretation": "Passenger class significantly affects survival chances" if p_value < 0.05 else "No significant relationship between class and survival"
                },
                
                "trends": [
                    "Higher passenger classes show dramatically better survival rates",
                    "Economic status appears to be a strong predictor of survival",
                    "Class-based survival differences suggest systematic bias in evacuation procedures"
                ],
                
                "comparisons": [
                    f"1st class passengers were {class_survival.loc[1, 'mean']/class_survival.loc[3, 'mean']:.1f}x more likely to survive than 3rd class",
                    f"Mortality rate difference between highest and lowest class: {(1-class_survival['mean'].min())*100 - (1-class_survival['mean'].max())*100:.1f}%"
                ],
                
                "business_recommendations": [
                    "🚨 **Safety Protocol Review**: Implement class-blind evacuation procedures",
                    "📊 **Data-Driven Policy**: Use survival analysis to improve maritime safety regulations",
                    "⚖️ **Equity Analysis**: Investigate systematic factors that contributed to survival disparities",
                    "🔍 **Risk Assessment**: Develop passenger risk profiles based on demographic factors"
                ]
            }
        except Exception as e:
            return self._generate_error_insights(str(e))
    
    def _analyze_age_insights(self, df: pd.DataFrame, chart_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze age distribution insights"""
        try:
            age_data = df['Age'].dropna()
            
            # Basic statistics
            mean_age = age_data.mean()
            median_age = age_data.median()
            std_age = age_data.std()
            age_range = age_data.max() - age_data.min()
            
            # Distribution analysis
            skewness = age_data.skew()
            kurtosis = age_data.kurtosis()
            
            # Age groups analysis
            children = age_data[age_data < 18].count()
            adults = age_data[(age_data >= 18) & (age_data < 65)].count()
            elderly = age_data[age_data >= 65].count()
            
            # Statistical tests
            normality_test = stats.normaltest(age_data)
            is_normal = normality_test.pvalue > self.significance_level
            
            # Survival analysis by age if available
            age_survival_insights = []
            if 'Survived' in df.columns:
                survived_ages = df[df['Survived'] == 1]['Age'].dropna()
                died_ages = df[df['Survived'] == 0]['Age'].dropna()
                
                if len(survived_ages) > 0 and len(died_ages) > 0:
                    t_stat, p_value = stats.ttest_ind(survived_ages, died_ages)
                    age_survival_insights = [
                        f"Average age of survivors: {survived_ages.mean():.1f} years",
                        f"Average age of casualties: {died_ages.mean():.1f} years",
                        f"Age difference significance: {'Significant' if p_value < 0.05 else 'Not significant'} (p={p_value:.4f})"
                    ]
            
            return {
                "key_findings": [
                    f"Average passenger age: {mean_age:.1f} years (median: {median_age:.1f})",
                    f"Age range: {age_data.min():.0f} to {age_data.max():.0f} years (span: {age_range:.0f} years)",
                    f"Age distribution: {children:,} children (<18), {adults:,} adults (18-64), {elderly:,} elderly (65+)",
                    f"Standard deviation: {std_age:.1f} years indicates {'high' if std_age > 15 else 'moderate'} age variability"
                ] + age_survival_insights,
                
                "statistical_significance": {
                    "test": "D'Agostino-Pearson normality test",
                    "p_value": f"{normality_test.pvalue:.4f}",
                    "result": "Normally distributed" if is_normal else "Not normally distributed",
                    "interpretation": "Age follows normal distribution pattern" if is_normal else "Age distribution shows significant deviation from normal"
                },
                
                "trends": [
                    f"Distribution is {'right-skewed (younger bias)' if skewness > 0.5 else 'left-skewed (older bias)' if skewness < -0.5 else 'approximately symmetric'}",
                    f"Kurtosis: {kurtosis:.2f} indicates {'heavy tails (extreme ages)' if abs(kurtosis) > 1 else 'normal tail distribution'}",
                    "Age pattern suggests typical passenger ship demographics of the era"
                ],
                
                "comparisons": [
                    f"Children represent {(children/len(age_data))*100:.1f}% of passengers",
                    f"Working-age adults dominate at {(adults/len(age_data))*100:.1f}% of passengers",
                    f"Elderly passengers: {(elderly/len(age_data))*100:.1f}% - {'typical' if elderly/len(age_data) < 0.15 else 'unusually high'} for the period"
                ],
                
                "business_recommendations": [
                    "👶 **Age-Specific Safety**: Develop targeted safety protocols for different age groups",
                    "📈 **Demographic Planning**: Use age distribution insights for capacity and service planning",
                    "🎯 **Risk Stratification**: Consider age as a factor in emergency response prioritization",
                    "📊 **Market Analysis**: Age demographics inform service offerings and pricing strategies"
                ]
            }
        except Exception as e:
            return self._generate_error_insights(str(e))
    
    def _analyze_gender_insights(self, df: pd.DataFrame, chart_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze gender distribution insights"""
        try:
            gender_counts = df['Sex'].value_counts()
            total = len(df['Sex'].dropna())
            
            male_count = gender_counts.get('male', 0)
            female_count = gender_counts.get('female', 0)
            male_pct = (male_count / total) * 100
            female_pct = (female_count / total) * 100
            
            # Gender survival analysis
            survival_insights = []
            statistical_test = None
            if 'Survived' in df.columns:
                gender_survival = df.groupby('Sex')['Survived'].agg(['count', 'sum', 'mean'])
                female_survival_rate = gender_survival.loc['female', 'mean'] * 100 if 'female' in gender_survival.index else 0
                male_survival_rate = gender_survival.loc['male', 'mean'] * 100 if 'male' in gender_survival.index else 0
                
                # Chi-square test for gender vs survival
                chi2_stat, p_value = self._chi_square_test(df, 'Sex', 'Survived')
                statistical_test = {
                    "test": "Chi-square test (Gender vs Survival)",
                    "p_value": f"{p_value:.4f}",
                    "result": "Statistically significant" if p_value < 0.05 else "Not statistically significant",
                    "interpretation": "Gender significantly affects survival chances" if p_value < 0.05 else "No significant relationship between gender and survival"
                }
                
                survival_insights = [
                    f"Female survival rate: {female_survival_rate:.1f}%",
                    f"Male survival rate: {male_survival_rate:.1f}%",
                    f"Gender survival gap: {abs(female_survival_rate - male_survival_rate):.1f} percentage points"
                ]
            
            # Age by gender analysis if available
            age_gender_insights = []
            if 'Age' in df.columns:
                age_by_gender = df.groupby('Sex')['Age'].agg(['mean', 'std']).round(1)
                if 'female' in age_by_gender.index and 'male' in age_by_gender.index:
                    age_gender_insights = [
                        f"Average female age: {age_by_gender.loc['female', 'mean']:.1f} years",
                        f"Average male age: {age_by_gender.loc['male', 'mean']:.1f} years"
                    ]
            
            return {
                "key_findings": [
                    f"Gender distribution: {male_count:,} males ({male_pct:.1f}%), {female_count:,} females ({female_pct:.1f}%)",
                    f"Gender ratio: {male_count/female_count:.2f} males per female" if female_count > 0 else "Only males in dataset",
                    f"Total passengers with gender data: {total:,}"
                ] + survival_insights + age_gender_insights,
                
                "statistical_significance": statistical_test or "No statistical tests performed",
                
                "trends": [
                    f"{'Male-dominated' if male_pct > 60 else 'Female-dominated' if female_pct > 60 else 'Balanced'} passenger composition",
                    "Gender distribution reflects typical travel patterns of the early 1900s",
                    "Survival patterns show clear gender-based differences consistent with 'women and children first' protocol"
                ],
                
                "comparisons": [
                    f"Male passengers outnumber females by {abs(male_count - female_count):,} passengers",
                    f"Gender imbalance: {abs(male_pct - female_pct):.1f} percentage point difference",
                    "Historical context: Gender distribution typical for transatlantic passenger ships of the era"
                ],
                
                "business_recommendations": [
                    "⚖️ **Equal Safety Standards**: Ensure gender-neutral emergency procedures and safety protocols",
                    "📊 **Demographic Insights**: Use gender distribution data for service planning and resource allocation",
                    "🎯 **Historical Analysis**: Compare gender survival patterns with modern maritime safety standards",
                    "📈 **Social Research**: Analyze how historical gender roles affected survival outcomes"
                ]
            }
        except Exception as e:
            return self._generate_error_insights(str(e))
    
    def _analyze_correlation_insights(self, df: pd.DataFrame, chart_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze correlation matrix insights"""
        try:
            numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
            corr_matrix = df[numeric_cols].corr()
            
            # Find strongest correlations
            correlations = []
            for i in range(len(corr_matrix.columns)):
                for j in range(i+1, len(corr_matrix.columns)):
                    col1, col2 = corr_matrix.columns[i], corr_matrix.columns[j]
                    corr_val = corr_matrix.iloc[i, j]
                    if not np.isnan(corr_val):
                        correlations.append((col1, col2, corr_val))
            
            # Sort by absolute correlation value
            correlations.sort(key=lambda x: abs(x[2]), reverse=True)
            strongest_correlations = correlations[:5]
            
            # Interpret correlation strength
            def interpret_correlation(r):
                abs_r = abs(r)
                if abs_r >= 0.7:
                    return "Strong"
                elif abs_r >= 0.5:
                    return "Moderate"
                elif abs_r >= 0.3:
                    return "Weak"
                else:
                    return "Very weak"
            
            correlation_findings = []
            for col1, col2, corr_val in strongest_correlations:
                strength = interpret_correlation(corr_val)
                direction = "positive" if corr_val > 0 else "negative"
                correlation_findings.append(f"{col1} vs {col2}: {strength} {direction} correlation (r={corr_val:.3f})")
            
            return {
                "key_findings": [
                    f"Analyzed correlations between {len(numeric_cols)} numeric variables",
                    f"Strongest correlation: {strongest_correlations[0][0]} and {strongest_correlations[0][1]} (r={strongest_correlations[0][2]:.3f})",
                    f"Average absolute correlation: {np.mean([abs(c[2]) for c in correlations]):.3f}"
                ] + correlation_findings[:3],
                
                "statistical_significance": {
                    "test": "Pearson correlation coefficients",
                    "interpretation": "Correlations above 0.3 (absolute) indicate meaningful relationships",
                    "significant_pairs": len([c for c in correlations if abs(c[2]) > 0.3])
                },
                
                "trends": [
                    f"{'High' if len([c for c in correlations if abs(c[2]) > 0.7]) > 2 else 'Moderate' if len([c for c in correlations if abs(c[2]) > 0.5]) > 3 else 'Low'} overall correlation structure",
                    "Correlation patterns reveal underlying data relationships and potential redundancies",
                    "Strong correlations may indicate multicollinearity concerns for predictive modeling"
                ],
                
                "comparisons": [
                    f"Positive correlations: {len([c for c in correlations if c[2] > 0.3])}, Negative: {len([c for c in correlations if c[2] < -0.3])}",
                    f"Variables with highest connectivity: {max(numeric_cols, key=lambda x: sum(1 for c in correlations if (c[0] == x or c[1] == x) and abs(c[2]) > 0.3))}",
                    "Correlation matrix reveals natural groupings and relationships within the dataset"
                ],
                
                "business_recommendations": [
                    "🔍 **Feature Selection**: Use correlation insights to identify redundant variables for modeling",
                    "📊 **Data Reduction**: Consider principal component analysis for highly correlated variables",
                    "🎯 **Relationship Mapping**: Leverage strong correlations to understand business drivers",
                    "⚖️ **Model Validation**: Account for multicollinearity in predictive model development"
                ]
            }
        except Exception as e:
            return self._generate_error_insights(str(e))
    
    def _chi_square_test(self, df: pd.DataFrame, col1: str, col2: str) -> tuple:
        """Perform chi-square test of independence"""
        try:
            contingency_table = pd.crosstab(df[col1], df[col2])
            chi2_stat, p_value, dof, expected = stats.chi2_contingency(contingency_table)
            return chi2_stat, p_value
        except:
            return 0, 1
    
    def _generate_generic_insights(self, df: pd.DataFrame, chart_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate generic insights for unknown chart types"""
        return {
            "key_findings": [
                f"Chart contains data from {len(df)} records",
                "Visual analysis reveals data patterns and distributions",
                "Additional context needed for detailed statistical analysis"
            ],
            "statistical_significance": "Statistical tests not available for this chart type",
            "trends": ["Data visualization shows underlying patterns in the dataset"],
            "comparisons": ["Comparative analysis requires specific domain context"],
            "business_recommendations": [
                "📊 **Data Exploration**: Use this visualization to identify areas for deeper analysis",
                "🔍 **Pattern Recognition**: Look for outliers and anomalies in the visual representation"
            ]
        }
    
    def _generate_error_insights(self, error_msg: str) -> Dict[str, Any]:
        """Generate error insights when analysis fails"""
        return {
            "key_findings": [f"Analysis unavailable: {error_msg}"],
            "statistical_significance": "Not calculated due to error",
            "trends": ["Unable to determine trends"],
            "comparisons": ["Unable to perform comparisons"],
            "business_recommendations": ["🔧 **Data Quality**: Check data quality and completeness for better insights"]
        }
